/**
 * Hugging Face Inference provider worker (text-to-image).
 *
 * Raw fetch is NOT used here: HF's router can redirect to a concrete inference
 * endpoint on another host, and fetch drops the Authorization header on
 * cross-origin redirects (surfacing as 401 "Missing Authentication header").
 * `@huggingface/inference` handles routing + auth correctly, and accepts
 * negative_prompt natively in `parameters` for models that support it.
 */
import { resolveModel } from "../models";
import {
  ProviderError,
  toProviderError,
  providerKey,
  type GenerateStickerRequest,
  type GenerateStickerResult,
} from "./_common";

export async function huggingFaceWorker(
  req: GenerateStickerRequest,
): Promise<GenerateStickerResult> {
  const key = providerKey("huggingface");
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