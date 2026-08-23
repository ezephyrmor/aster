import type { StickerProviderName } from "./providers/_common";

/**
 * Curated model catalog per provider, categorized by freeness of use.
 * Static on purpose: image-model lineups change monthly at most, and live
 * fetching would add latency/caching/failure modes for little benefit.
 *
 * Tiers:
 *  - "free"      — genuinely free (no key cost, rate-limited quota).
 *  - "free-tier" — free with daily limits on the provider's own API key.
 *  - "paid"      — requires credits / paid plan.
 */
export type ModelTier = "free" | "free-tier" | "paid";

export type CatalogModel = {
  id: string;
  label: string;
  tier: ModelTier;
  note?: string;
};

export const PROVIDER_MODELS: Record<StickerProviderName, CatalogModel[]> = {
  huggingface: [
    {
      id: "black-forest-labs/FLUX.1-schnell",
      label: "FLUX.1 Schnell",
      tier: "free",
      note: "Apache-2.0, fast, not gated — best free default.",
    },
    {
      id: "stabilityai/stable-diffusion-xl-base-1.0",
      label: "Stable Diffusion XL 1.0",
      tier: "free",
      note: "Classic SDXL, slower than FLUX schnell.",
    },
  ],
  google: [
    {
      // Native Gemini image model (imagen-3.0-generate-002 / the legacy
      // :predict path are retired). Uses generateContent + responseModalities.
      id: "gemini-3.1-flash-image",
      label: "Gemini 3.1 Flash Image",
      tier: "free-tier",
      note: "Requires a Google AI Studio key; usage may incur quota/billing.",
    },
  ],
  openrouter: [
    {
      id: "google/gemini-2.5-flash-image",
      label: "Gemini 2.5 Flash Image",
      tier: "paid",
      note: "Cheapest OpenRouter image model.",
    },
    { id: "google/gemini-3.1-flash-image", label: "Gemini 3.1 Flash Image", tier: "paid" },
    { id: "google/gemini-3-pro-image", label: "Gemini 3 Pro Image", tier: "paid" },
    { id: "openai/gpt-image-mini", label: "GPT Image Mini", tier: "paid" },
    { id: "openai/gpt-5-image", label: "GPT Image", tier: "paid" },
  ],
  openai: [
    { id: "gpt-image-1", label: "GPT Image 1", tier: "paid", note: "Native transparent PNG." },
    { id: "dall-e-3", label: "DALL·E 3", tier: "paid" },
  ],
  stability: [
    { id: "core", label: "Stable Image Core", tier: "paid" },
    { id: "ultra", label: "Stable Image Ultra", tier: "paid" },
  ],
  mock: [{ id: "mock", label: "Placeholder renderer", tier: "free" }],
};

/** Ordered free-first fallback chain tried when the chosen provider fails hard. */
export const MODEL_FALLBACK_CHAIN: StickerProviderName[] = ["huggingface", "google"];

export function defaultModelFor(provider: StickerProviderName): string {
  return PROVIDER_MODELS[provider][0]?.id ?? "";
}

/** Allowlist check — unknown model ids are rejected before hitting providers. */
export function isValidModel(provider: StickerProviderName, modelId: string): boolean {
  return PROVIDER_MODELS[provider].some((m) => m.id === modelId);
}

/** Resolve a user/env-selected model id against the catalog. */
export function resolveModel(
  provider: StickerProviderName,
  requested?: string | null,
): string {
  const envKey =
    provider === "huggingface"
      ? process.env.HUGGINGFACE_MODEL
      : provider === "openrouter"
        ? process.env.AI_MODEL
        : undefined;
  const candidate = requested || envKey || defaultModelFor(provider);
  return isValidModel(provider, candidate) ? candidate : defaultModelFor(provider);
}
