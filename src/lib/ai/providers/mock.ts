/**
 * Mock provider — renders a simple centered transparent shape via the image
 * processor so the full pipeline is testable in dev without any AI key.
 */
import { renderMockSticker } from "../image-processor";
import type { GenerateStickerRequest, GenerateStickerResult } from "./_common";

export async function mockProvider(req: GenerateStickerRequest): Promise<GenerateStickerResult> {
  const buffer = await renderMockSticker(req.size ?? 1024);
  return { buffer, mimeType: "image/png" };
}