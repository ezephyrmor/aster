import { describe, it, expect } from "vitest";
import {
  StickerPackSchema,
  STICKER_SIZES,
  PIXEL_ART_SIZES,
  MIN_STANDARD_SIZE,
} from "@/lib/validations/sticker.schema";

const basePack = {
  name: "Test Pack",
  theme: "gaming",
  style: "pixel-art",
  count: 1,
};

describe("StickerPackSchema — output sizes", () => {
  it("accepts every listed size for pixel-art packs", () => {
    for (const size of STICKER_SIZES) {
      const parsed = StickerPackSchema.safeParse({ ...basePack, style: "pixel-art", size });
      expect(parsed.success, `size ${size} should parse`).toBe(true);
    }
  });

  it("accepts sub-256 sizes only for the pixel-art style", () => {
    for (const size of PIXEL_ART_SIZES) {
      const ok = StickerPackSchema.safeParse({ ...basePack, style: "pixel-art", size });
      expect(ok.success, `${size}px pixel-art should be valid`).toBe(true);

      const bad = StickerPackSchema.safeParse({
        ...basePack,
        style: "kawaii",
        size,
      });
      expect(bad.success, `${size}px kawaii should be rejected`).toBe(false);
      if (!bad.success) {
        const messages = bad.error.issues.map((i) => i.message).join(" ");
        expect(messages).toContain("pixel-art");
      }
    }
  });

  it("still accepts standard sizes for non-pixel-art styles", () => {
    const parsed = StickerPackSchema.safeParse({
      ...basePack,
      style: "kawaii",
      size: MIN_STANDARD_SIZE,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unlisted sizes", () => {
    const bad = StickerPackSchema.safeParse({ ...basePack, size: 300 });
    expect(bad.success).toBe(false);
  });
});
