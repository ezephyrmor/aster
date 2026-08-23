/**
 * OpenAI image provider worker (GPT Image / DALL·E).
 *
 * OpenAI has no native negative prompt — negatives are injected into the
 * positive prompt as hard instructions. Uses the Images API
 * (`/v1/images/generations`) with `response_format: "b64_json"`.
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

export async function openAiWorker(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
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