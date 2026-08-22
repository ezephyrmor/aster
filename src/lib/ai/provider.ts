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
import { MODEL_FALLBACK_CHAIN, resolveModel } from "./models";

export type StickerProviderName =
  | "openai"
  | "stability"
  | "google"
  | "openrouter"
  | "huggingface"
  | "mock";

export const STICKER_PROVIDERS: StickerProviderName[] = [
  "openai",
  "stability",
  "google",
  "openrouter",
  "huggingface",
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
    /** Optional, safe-to-show remediation hint (never contains secrets). */
    public readonly hint?: string,
    /** Truncated provider response body — extra context for the UI. */
    public readonly detail?: string,
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
  /** Unused by workers; kept for request symmetry. */
  outline?: boolean;
  provider: StickerProviderName;
  /** Optional catalog model id (validated by resolveModel). */
  model?: string;
};

export type GenerateStickerResult = {
  buffer: Buffer;
  mimeType: "image/png" | "image/webp";
  /** Which provider actually produced this image (differs on fallback). */
  provider?: StickerProviderName;
};

/** Map a thrown value into a typed ProviderError. */
function toProviderError(err: unknown, provider: string): ProviderError {
  if (err instanceof ProviderError) return err;

  // Status may live on the error object or inside the message (e.g. "HTTP 401").
  const objStatus =
    typeof err === "object" && err !== null && "status" in err
      ? (err as { status?: number }).status
      : undefined;
  const msgText = err instanceof Error ? err.message : "";
  const msgStatus = Number(/(?:HTTP|status(?:Code)?)\D*(\d{3})/i.exec(msgText)?.[1]);
  const status = objStatus ?? (Number.isFinite(msgStatus) ? msgStatus : undefined);

  if (status === 429) return new ProviderError("rate-limit", `${provider} rate limited`);
  if (status === 404)
    return new ProviderError(
      "invalid-response",
      `${provider}: model or endpoint not found`,
      "Check the configured model id (AI_MODEL / HUGGINGFACE_MODEL) — it may not be available on this provider.",
    );
  if (status === 401 || status === 403)
    return new ProviderError(
      "invalid-response",
      `${provider} rejected the credentials`,
      "Verify the API key, and for gated models accept the model license on the provider's site using the key's account.",
    );
  if (status === 503)
    return new ProviderError(
      "provider",
      `${provider} model is loading`,
      "The model is warming up — retry in a few seconds.",
    );
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
    case "huggingface":
      return process.env.HUGGINGFACE_API_KEY;
    case "mock":
      return undefined;
  }
}

export function isProviderConfigured(p: StickerProviderName): boolean {
  return p === "mock" || Boolean(providerKey(p));
}

export function supportsNativeNegative(p: StickerProviderName): boolean {
  return (
    p === "stability" ||
    p === "openrouter" ||
    // HF text-to-image models accept negative_prompt in `parameters`.
    p === "huggingface"
  );
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

/**
 * Convert a non-ok provider response into a typed, actionable ProviderError.
 * Logs status + truncated body server-side (never logs keys), and attaches a
 * safe remediation hint where the cause is well-known.
 */
async function responseToProviderError(
  res: Response,
  label: string,
): Promise<ProviderError> {
  const body = await res.text().catch(() => "");
  const snippet = body.replace(/\s+/g, " ").trim().slice(0, 300);
  console.error(
    `[sticker-ai] ${label} HTTP ${res.status}: ${snippet || "<empty body>"}`,
  );
  // Short, UI-safe detail — prefixed with provider + status so the toast
  // itself identifies WHO rejected the request (no more guessing).
  const detail = `[${label} · HTTP ${res.status}] ${snippet.slice(0, 180)}`;

  if (res.status === 429)
    return new ProviderError("rate-limit", `${label} rate limited`, undefined, detail);
  if (res.status === 404)
    return new ProviderError(
      "invalid-response",
      `${label}: model or endpoint not found`,
      "Check the configured model id (AI_MODEL / HUGGINGFACE_MODEL) — it may not be available on this provider.",
      detail,
    );
  if (res.status === 401 || res.status === 403)
    return new ProviderError(
      "invalid-response",
      `${label} rejected the credentials`,
      "Verify the API key, and for gated models accept the model license on the provider's site using the key's account.",
      detail,
    );
  if (res.status === 503)
    return new ProviderError(
      "provider",
      `${label} model is loading`,
      "The model is warming up — retry in a few seconds.",
      detail,
    );
  if (res.status === 402)
    return new ProviderError(
      "invalid-response",
      `${label} account has insufficient credits`,
      "Top up credits on the provider, or rely on the free fallback providers.",
      detail,
    );
  if (res.status >= 500)
    return new ProviderError("provider", `${label} provider error`, undefined, detail);
  return new ProviderError(
    "invalid-response",
    `${label} rejected the request`,
    undefined,
    detail,
  );
}

/** Shared JSON → image helper. Throws typed ProviderError on failure. */
async function postForImage(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  label = "provider",
  timeoutMs = 90_000,
): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Follow redirects MANUALLY so the Authorization header survives. Native
    // fetch drops auth headers on cross-origin redirects, which some providers
    // (HF router, CDNs) trigger — surfacing as 401 "Missing Authentication
    // header" even though we sent a key.
    let currentUrl: string = url;
    let res: Response = await fetch(currentUrl, {
      method: "POST",
      headers: { Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
      redirect: "manual",
    });
    for (let hop = 0; hop < 4 && res.status >= 300 && res.status < 400; hop++) {
      const location = res.headers.get("location");
      if (!location) break;
      currentUrl = new URL(location, currentUrl).toString();
      console.warn(`[sticker-ai] ${label} redirect ${res.status} → ${currentUrl}`);
      res = await fetch(currentUrl, {
        method: "POST",
        headers: { Accept: "application/json", ...headers },
        body: JSON.stringify(body),
        signal: controller.signal,
        redirect: "manual",
      });
    }
    if (!res.ok) throw await responseToProviderError(res, label);

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
    throw toProviderError(err, label);
  } finally {
    clearTimeout(timer);
  }
}

/** Shared multipart helper (Stability's image API uses form-data). */
async function postMultipartImage(
  url: string,
  headers: Record<string, string>,
  fields: Record<string, string | number>,
  label = "provider",
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
  if (!res.ok) throw await responseToProviderError(res, label);
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
        model: resolveModel("openai", req.model),
        prompt,
        size: `${req.size}x${req.size}`,
        n: 1,
        response_format: "b64_json",
      },
      "openai",
    );
  return { buffer, mimeType: "image/png" };
}

async function stabilityWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.STABILITY_API_KEY;
  if (!key) throw new ProviderError("not-configured", "Stability key not configured");
  const engine = resolveModel("stability", req.model);
  const buffer = await postMultipartImage(
    `https://api.stability.ai/v2beta/stable-image/generate/${engine}`,
    { Authorization: `Bearer ${key}` },
    {
      prompt: req.positivePrompt,
      negative_prompt: req.negativePrompt ?? "",
      output_format: "png",
      width: req.size,
      height: req.size,
    },
    "stability",
  );
  return { buffer, mimeType: "image/png" };
}

async function googleWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new ProviderError("not-configured", "Google key not configured");
  const prompt = injectNegative(req.positivePrompt, req.negativePrompt);
  const model = resolveModel("google", req.model);
  const buffer = await postForImage(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${encodeURIComponent(key)}`,
    {},
    {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1" },
    },
    "google",
  );
  return { buffer, mimeType: "image/png" };
}

async function openrouterWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new ProviderError("not-configured", "OpenRouter key not configured");
  // Model resolution: request → env (AI_MODEL) → catalog default. Providers
  // without native negative support receive it via text injection.
  const model = resolveModel("openrouter", req.model);
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
    "openrouter",
  );
  return { buffer, mimeType: "image/png" };
}

/**
 * Hugging Face Inference (text-to-image) via the official client.
 *
 * Raw fetch is NOT used here: HF's router can redirect to a concrete inference
 * endpoint on another host, and fetch drops the Authorization header on
 * cross-origin redirects (surfacing as 401 "Missing Authentication header").
 * `@huggingface/inference` handles routing + auth correctly, and accepts
 * negative_prompt natively in `parameters` for models that support it.
 */
async function huggingFaceWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) throw new ProviderError("not-configured", "Hugging Face key not configured");
  const model = resolveModel("huggingface", req.model);

  const { InferenceClient } = await import("@huggingface/inference");
  const client = new InferenceClient(key);

  try {
    const blob = await client.textToImage(
      {
        model,
        inputs: req.positivePrompt,
        parameters: {
          negative_prompt: req.negativePrompt ?? "",
          width: req.size,
          height: req.size,
        },
      },
      { outputType: "blob" },
    );
    const buffer = Buffer.from(await blob.arrayBuffer());
    if (buffer.length === 0) {
      throw new ProviderError("invalid-response", "Empty image from provider");
    }
    return { buffer, mimeType: "image/png" };
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    // Surface the provider's own message (truncated) for UI detail.
    const raw = err instanceof Error ? err.message : "";
    const detail = raw.replace(/\s+/g, " ").trim().slice(0, 200) || undefined;
    const mapped = toProviderError(err, "huggingface");

    // Well-known HF token-permission failure: fine-grained tokens must enable
    // "Make calls to Inference Providers".
    if (/sufficient permissions|Inference Providers/i.test(detail ?? "")) {
      throw new ProviderError(
        "invalid-response",
        "Your Hugging Face token is not allowed to call Inference Providers.",
        'On huggingface.co → Settings → Access Tokens, create a fine-grained token with "Make calls to Inference Providers" enabled (or use a classic token), then update HUGGINGFACE_API_KEY.',
        detail,
      );
    }

    throw new ProviderError(mapped.kind, mapped.message, mapped.hint, detail);
  }
}

/**
 * Hard failures that will not fix themselves on retry with the same
 * provider/model — these trigger the free-first fallback chain.
 */
function isFallbackWorthy(err: unknown): boolean {
  if (!(err instanceof ProviderError)) return false;
  if (err.kind === "not-configured") return true;
  const text = `${err.message} ${err.hint ?? ""} ${err.detail ?? ""}`;
  return /insufficient credits|rejected the credentials|not found|model or endpoint/i.test(text);
}

/**
 * Primary entry point used by routes. Dispatches to the selected provider and
 * guarantees a typed ProviderError (never a raw client/network error).
 *
 * Free-first fallback: when the chosen provider fails with a hard error (no
 * key, bad credentials, insufficient credits, unknown model), the remaining
 * configured providers in MODEL_FALLBACK_CHAIN are tried in order. The result
 * reports which provider actually served the request.
 */
export async function generateSticker(
  req: GenerateStickerRequest,
): Promise<GenerateStickerResult> {
  const provider = req.provider || (process.env.AI_PROVIDER as StickerProviderName) || "mock";

  if (!STICKER_PROVIDERS.includes(provider)) {
    throw new ProviderError("not-configured", `Unknown provider "${provider}"`);
  }

  const workerFor = (p: StickerProviderName) => {
    switch (p) {
      case "openai":
        return openAiWorker;
      case "stability":
        return stabilityWorker;
      case "google":
        return googleWorker;
      case "openrouter":
        return openrouterWorker;
      case "huggingface":
        return huggingFaceWorker;
      case "mock":
        return mockProvider;
    }
  };

  const chain = [
    provider,
    ...MODEL_FALLBACK_CHAIN.filter(
      (p) => p !== provider && isProviderConfigured(p),
    ),
  ];

  let firstError: unknown;
  for (const p of chain) {
    try {
      const result = await workerFor(p)({ ...req, provider: p });
      return { ...result, provider: p };
    } catch (err) {
      const mapped = err instanceof ProviderError ? err : toProviderError(err, p);
      if (!firstError) firstError = mapped;
      // Only hard failures move down the chain; transient errors rethrow.
      if (!isFallbackWorthy(mapped) || p === chain[chain.length - 1]) throw mapped;
      console.warn(`[sticker-ai] ${p} failed (${mapped.message}) — falling back`);
    }
  }
  throw firstError;
}