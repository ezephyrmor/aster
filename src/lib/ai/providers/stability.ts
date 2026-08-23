/**
 * Stability provider worker (Stable Image Core / Ultra).
 *
 * Stability accepts a native multipart `form-data` request. Its image API is
 * form-encoded (not JSON), so this uses `postMultipartImage`.
 */
import { resolveModel } from "../models";
import {
  ProviderError,
  postMultipartImage,
  providerKey,
  type GenerateStickerRequest,
  type GenerateStickerResult,
} from "./_common";

export async function stabilityWorker(
  req: GenerateStickerRequest,
): Promise<GenerateStickerResult> {
  const key = providerKey("stability");
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