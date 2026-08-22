/**
 * Sticker generation orchestration (server-side).
 *
 * Ties together the prompt builder, the provider abstraction, and the image
 * processing pipeline. Routes call `generateOneSticker(...)` — the single
 * "one item → one AI call → one processed transparent PNG" unit of work.
 */
import {
  ProviderError,
  generateSticker,
  type StickerProviderName,
} from "./provider";
import { buildStickerPrompt, type StickerPromptInput } from "./sticker-prompts";
import { processStickerImage } from "./image-processor";
import { stickerFilename } from "./filename";

export type GenerateOneInput = {
  provider: StickerProviderName;
  itemName: string;
  pack: {
    theme: string;
    style: string;
    size: number;
    transparent: boolean;
    outline: boolean;
    batchInstructions?: string | null;
    negativePrompt?: string | null;
  };
  item?: {
    instructions?: string | null;
    negativeInstructions?: string | null;
  };
};

/** Human-friendly (non-secret) error message for the UI. */
export function publicErrorMessage(err: unknown): string {
  if (err instanceof ProviderError) {
    let message: string;
    switch (err.kind) {
      case "not-configured":
        message = "The selected AI provider is not configured on this server.";
        break;
      case "rate-limit":
        message = "The AI provider is rate-limiting requests. Please wait and retry.";
        break;
      case "timeout":
        message = "The AI provider request timed out. Please retry.";
        break;
      case "invalid-response":
        message = "The AI provider rejected this request. See the details and retry.";
        break;
      default:
        message = "The AI provider failed. Please retry.";
    }
    // Hints/details are static or truncated provider text — no secrets/keys.
    const parts = [message];
    if (err.hint) parts.push(`Hint: ${err.hint}`);
    if (err.detail) parts.push(`Provider said: ${err.detail}`);
    return parts.join(" ");
  }
  return "Failed to generate this sticker. Please retry.";
}

export type OneStickerResult = {
  buffer: Buffer;
  filename: string;
  width: number;
  height: number;
  mimeType: string;
};

/**
 * Generate + process a single sticker. Never throws a raw provider/processing
 * error — throws ProviderError or ProcessingError so routes map safely.
 */
export async function generateOneSticker(input: GenerateOneInput): Promise<OneStickerResult> {
  const promptInput: StickerPromptInput = {
    theme: input.pack.theme,
    style: input.pack.style,
    itemName: input.itemName,
    batchInstructions: input.pack.batchInstructions,
    itemInstructions: input.item?.instructions,
    batchNegative: input.pack.negativePrompt,
    itemNegative: input.item?.negativeInstructions,
  };
  const { positive, negative } = buildStickerPrompt(promptInput);

  const raw = await generateSticker({
    positivePrompt: positive,
    negativePrompt: negative,
    size: input.pack.size,
    transparent: input.pack.transparent,
    outline: input.pack.outline,
    provider: input.provider,
  });

  const processed = await processStickerImage(raw.buffer, {
    canvasSize: input.pack.size,
    transparent: input.pack.transparent,
    outline: input.pack.outline,
  });

  return {
    buffer: processed.buffer,
    filename: stickerFilename(input.itemName, "png"),
    width: processed.width,
    height: processed.height,
    mimeType: "image/png",
  };
}