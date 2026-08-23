/**
 * Provider registry + dispatch.
 *
 * Wires the per-provider workers to `generateSticker()` and owns the free-first
 * fallback chain: when the chosen provider fails hard (no key, bad credentials,
 * insufficient credits, unknown model), the remaining configured providers in
 * `MODEL_FALLBACK_CHAIN` are tried in order. Typed ProviderErrors are guaranteed
 * out — never a raw client/network error — so routes map safely.
 */
import { MODEL_FALLBACK_CHAIN } from "../models";
import {
  STICKER_PROVIDERS,
  ProviderError,
  toProviderError,
  isProviderConfigured,
  type GenerateStickerRequest,
  type GenerateStickerResult,
  type StickerProviderName,
} from "./_common";
import { openAiWorker } from "./openai";
import { stabilityWorker } from "./stability";
import { googleWorker } from "./google";
import { openrouterWorker } from "./openrouter";
import { huggingFaceWorker } from "./huggingface";
import { mockProvider } from "./mock";

type Worker = (req: GenerateStickerRequest) => Promise<GenerateStickerResult>;

function workerFor(p: StickerProviderName): Worker {
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
 * Error attribution is important: the user asked for the CHOSEN provider, so
 * when everything falls back and fails the surfaced error is the chosen
 * provider's own failure — never a free-fallback provider's (e.g. don't blame
 * Hugging Face credits when the user picked Google). Fallback providers'
 * failures are suppressed; only the chosen provider's reason is reported.
 */
export async function generateSticker(
  req: GenerateStickerRequest,
): Promise<GenerateStickerResult> {
  const provider = req.provider || (process.env.AI_PROVIDER as StickerProviderName) || "mock";

  if (!STICKER_PROVIDERS.includes(provider)) {
    throw new ProviderError("not-configured", `Unknown provider "${provider}"`);
  }

  const chain = [
    provider,
    ...MODEL_FALLBACK_CHAIN.filter(
      (p) => p !== provider && isProviderConfigured(p),
    ),
  ];

  // The chosen provider's failure, remembered so a fallback failure is never
  // surfaced in its place.
  let chosenProviderError: ProviderError | null = null;

  for (const p of chain) {
    try {
      const result = await workerFor(p)({ ...req, provider: p });
      return { ...result, provider: p };
    } catch (err) {
      const mapped = err instanceof ProviderError ? err : toProviderError(err, p);

      if (p === provider) {
        // Chosen provider: hard failures fall back; transient errors (rate-limit,
        // timeout, provider-loading) must NOT silently switch providers — rethrow.
        if (!isFallbackWorthy(mapped)) throw mapped;
        chosenProviderError = mapped;
        console.warn(`[sticker-ai] ${p} failed (${mapped.message}) — falling back`);
        continue;
      }

      // Free-fallback provider: never surface this failure. Keep trying the
      // remaining fallbacks (free-first); when they're all exhausted the chosen
      // provider's error is reported below.
      console.warn(`[sticker-ai] fallback ${p} failed (${mapped.message}) — trying next`);
    }
  }

  // All providers failed (or the chosen provider hard-failed with no fallback).
  throw (
    chosenProviderError ??
    new ProviderError("provider", "All AI providers failed to generate an image")
  );
}