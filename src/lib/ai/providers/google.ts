/**
 * Google (Gemini/Imagen) provider worker.
 *
 * Uses the Gemini REST `:generateContent` endpoint with native image output
 * (`responseModalities: ["IMAGE"]`). Gemini image models have no native
 * negative param — negatives are injected into the prompt. The response image
 * comes back as base64 in `candidates[].content.parts[].inlineData.data`, which
 * `postForImage` already unwraps.
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