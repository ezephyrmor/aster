/**
 * OpenRouter provider worker (multi-vendor image models via one endpoint).
 *
 * OpenRouter's dedicated image API
 * (`https://openrouter.ai/api/v1/images/generations`) does NOT accept a
 * `negative_prompt` field — negatives are injected into the positive prompt
 * (same convention as OpenAI). We always request a single square PNG at the
 * pack size, and when the pack wants transparency we also ask for a PNG with a
 * transparent background (the pipeline's cutout cleanup is the second line of
 * defense for whatever the model returns).
 */
import { resolveModel } from "../models";
import {
  ProviderError,
  injectNegative,
  postForImage,
  providerKey,
  type GenerateStickerRequest,
  type GenerateStickerResult,
} from "./_common";

export async function openrouterWorker(
  req: GenerateStickerRequest,
): Promise<GenerateStickerResult> {
  const key = providerKey("openrouter");
  if (!key) throw new ProviderError("not-configured", "OpenRouter key not configured");
  const model = resolveModel("openrouter", req.model);
  const prompt = injectNegative(req.positivePrompt, req.negativePrompt);
  const buffer = await postForImage(
    "https://openrouter.ai/api/v1/images/generations",
    { Authorization: `Bearer ${key}` },
    {
      model,
      prompt,
      n: 1,
      size: `${req.size}x${req.size}`,
      // Transparency is requested per-pack; asking the model directly for a
      // transparent PNG avoids a white matte the cutout would have to scrub.
      ...(req.transparent ? { output_format: "png", background: "transparent" } : {}),
    },
    "openrouter",
  );
  return { buffer, mimeType: "image/png" };
}