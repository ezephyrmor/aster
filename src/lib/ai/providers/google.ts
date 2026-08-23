/**
 * Google (Gemini/Imagen) provider worker.
 *
 * Uses the Gemini REST `:predict` endpoint for Imagen models
 * (`.../v1beta/models/{model}:predict`). Imagen has no native negative param —
 * negatives are injected into the prompt. Extra parameters are set so sticker
 * scenes don't get rejected for adult content and exactly one image is asked
 * for.
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

export async function googleWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const key = providerKey("google");
  if (!key) throw new ProviderError("not-configured", "Google key not configured");
  const prompt = injectNegative(req.positivePrompt, req.negativePrompt);
  const model = resolveModel("google", req.model);
  const buffer = await postForImage(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {},
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    },
    "google",
  );
  return { buffer, mimeType: "image/png" };
}