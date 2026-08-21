/**
 * AI provider abstraction for sticker generation.
 *
 * Multi-provider, decoupled by design: routes call `generateSticker()` and never
 * touch provider internals or API keys. Providers read their own key from
 * `process.env` — server-side only, never shipped to the browser.
 *
 * Negative prompt handling is provider-aware (spec):
 *  - Providers with a native `negative_prompt` param receive it separately.
 *  - Providers without one get the important restrictions injected into the
 *    positive prompt text as hard instructions.
 */
import { renderMockSticker } from "./image-processor";

export type StickerProviderName =
  | "openai"
  | "stability"
  | "google"
  | "openrouter"
  | "mock";

export const STICKER_PROVIDERS: StickerProviderName[] = [
  "openai",
  "stability",
  "google",
  "openrouter",
  "mock",
];

/** Typed failures so routes can map to safe, generic messages. */
export class ProviderError extends Error {
  constructor(
    public readonly kind:
      | "not-configured"
      | "provider"
      | "timeout"
      | "rate-limit"
      | "invalid-response",
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export type GenerateStickerRequest = {
  positivePrompt: string;
  negativePrompt?: string;
  size: number;
  transparent: boolean;
  outline: boolean;
  provider: StickerProviderName;
};

export type GenerateStickerResult = {
  buffer: Buffer;
  mimeType: "image/png" | "image/webp";
};

/** Map a thrown value into a typed ProviderError. */
function toProviderError(err: unknown, provider: string): ProviderError {
  if (err instanceof ProviderError) return err;

  const status =
    typeof err === "object" && err !== null && "status" in err
      ? (err as { status?: number }).status
      : undefined;

  if (status === 429) return new ProviderError("rate-limit", `${provider} rate limited`);
  if (status != null && status >= 400 && status < 500)
    return new ProviderError("invalid-response", `${provider} rejected the request`);
  if (status != null && status >= 500)
    return new ProviderError("provider", `${provider} provider error`);
  if (err instanceof Error && /timeout|timed ?out/i.test(err.message))
    return new ProviderError("timeout", `${provider} request timed out`);
  return new ProviderError("provider", `${provider} request failed`);
}

/** Server-side key per provider. */
function providerKey(p: StickerProviderName): string | undefined {
  switch (p) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "stability":
      return process.env.STABILITY_API_KEY;
    case "google":
      return process.env.GOOGLE_API_KEY;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "mock":
      return undefined;
  }
}

export function isProviderConfigured(p: StickerProviderName): boolean {
  return p === "mock" || Boolean(providerKey(p));
}

export function supportsNativeNegative(p: StickerProviderName): boolean {
  return p === "stability" || p === "openrouter";
}

function injectNegative(positive: string, negative: string | undefined): string {
  if (!negative) return positive;
  return `${positive}. STRICTLY AVOID: ${negative}.`;
}

/** Recursively find the first base64 image encoded in a JSON provider payload. */
export function extractFirstB64(json: unknown): string | null {
  if (typeof json === "string") {
    const dataUri = json.match(/data:image\/(png|webp);base64,([A-Za-z0-9+/=]+)/);
    if (dataUri) return dataUri[2];
    if (/^[A-Za-z0-9+/=]{16,}$/.test(json)) return json;
    return null;
  }
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = extractFirstB64(item);
      if (found) return found;
    }
    return null;
  }
  if (json && typeof json === "object") {
    for (const value of Object.values(json)) {
      const found = extractFirstB64(value);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively find the first image URL in a provider JSON payload. Some image
 * APIs (including OpenRouter "images/generations") return a URL rather than
 * base64. Returns null when only base64 (or nothing) is present.
 */
export function extractFirstImageUrl(json: unknown): string | null {
  if (typeof json === "string") {
    if (/^https?:\/\/.+\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(json)) return json;
    return null;
  }
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = extractFirstImageUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (json && typeof json === "object") {
    for (const value of Object.values(json)) {
      const found = extractFirstImageUrl(value);
      if (found) return found;
    }
  }
  return null;
}

/** Shared JSON → image helper. Throws typed ProviderError on failure. */
async function postForImage(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  timeoutMs = 90_000,
): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw { status: res.status } as unknown;

    const json = (await res.json()) as unknown;
    const b64 = extractFirstB64(json);
    if (b64) {
      return Buffer.from(b64, "base64");
    }
    // Some providers return an image URL instead of base64 — fetch it.
    const imageUrl = extractFirstImageUrl(json);
    if (!imageUrl) {
      throw new ProviderError(
        "invalid-response",
        "No image data found in provider response",
      );
    }
    const imageRes = await fetch(imageUrl, { signal: controller.signal });
    if (!imageRes.ok) throw { status: imageRes.status } as unknown;
    return Buffer.from(await imageRes.arrayBuffer());
  } catch (err) {
    clearTimeout(timer);
    throw toProviderError(err, "provider");
  } finally {
    clearTimeout(timer);
  }
}

/** Shared multipart helper (Stability's image API uses form-data). */
async function postMultipartImage(
  url: string,
  headers: Record<string, string>,
  fields: Record<string, string | number>,
): Promise<Buffer> {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) throw { status: res.status };
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0) {
    throw new ProviderError("invalid-response", "Empty image from provider");
  }
  return bytes;
}

/**
 * Mock provider — renders a simple centered transparent shape via the image
 * processor so the full pipeline is testable in dev without any AI key.
 */
async function mockProvider(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const buffer = await renderMockSticker(req.size ?? 1024);
  return { buffer, mimeType: "image/png" };
}

async function openAiWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = providerKey("openai");
  if (!key) throw new ProviderError("not-configured", "OpenAI key not configured");
  const prompt = injectNegative(req.positivePrompt, req.negativePrompt);
  const buffer = await postForImage(
    "https://api.openai.com/v1/images/generations",
    { Authorization: `Bearer ${key}` },
    {
      model: "gpt-image-1",
      prompt,
      size: `${req.size}x${req.size}`,
      n: 1,
      response_format: "b64_json",
    },
  );
  return { buffer, mimeType: "image/png" };
}

async function stabilityWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.STABILITY_API_KEY;
  if (!key) throw new ProviderError("not-configured", "Stability key not configured");
  const buffer = await postMultipartImage(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    { Authorization: `Bearer ${key}` },
    {
      prompt: req.positivePrompt,
      negative_prompt: req.negativePrompt ?? "",
      output_format: "png",
      width: req.size,
      height: req.size,
    },
  );
  return { buffer, mimeType: "image/png" };
}

async function googleWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new ProviderError("not-configured", "Google key not configured");
  const prompt = injectNegative(req.positivePrompt, req.negativePrompt);
  const buffer = await postForImage(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(key)}`,
    {},
    {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1" },
    },
  );
  return { buffer, mimeType: "image/png" };
}

async function openrouterWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new ProviderError("not-configured", "OpenRouter key not configured");
  // Model is configurable via env (default to a strong image model). Providers
  // without native negative support receive it via text injection.
  const model = process.env.AI_MODEL || "black-forest-labs/flux-1.1-pro";
  const buffer = await postForImage(
    "https://openrouter.ai/api/v1/images/generations",
    { Authorization: `Bearer ${key}` },
    {
      model,
      prompt: req.positivePrompt,
      negative_prompt: req.negativePrompt ?? "",
      n: 1,
      size: `${req.size}x${req.size}`,
    },
  );
  return { buffer, mimeType: "image/png" };
}

/**
 * Primary entry point used by routes. Dispatches to the selected provider and
 * guarantees a typed ProviderError (never a raw client/network error).
 */
export async function generateSticker(
  req: GenerateStickerRequest,
): Promise<GenerateStickerResult> {
  const provider = req.provider || (process.env.AI_PROVIDER as StickerProviderName) || "mock";

  if (!STICKER_PROVIDERS.includes(provider)) {
    throw new ProviderError("not-configured", `Unknown provider "${provider}"`);
  }

  let worker: (r: GenerateStickerRequest) => Promise<GenerateStickerResult>;
  switch (provider) {
    case "openai":
      worker = openAiWorker;
      break;
    case "stability":
      worker = stabilityWorker;
      break;
    case "google":
      worker = googleWorker;
      break;
    case "openrouter":
      worker = openrouterWorker;
      break;
    case "mock":
      worker = mockProvider;
      break;
  }

  try {
    return await worker(req);
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    throw toProviderError(err, provider);
  }
}