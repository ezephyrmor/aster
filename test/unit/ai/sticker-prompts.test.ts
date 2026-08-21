import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BASE_NEGATIVE_PROMPT,
  BASE_STICKER_PROMPT,
  buildStickerPrompt,
  buildNegativePrompt,
  STYLE_NEGATIVES,
} from "@/lib/ai/sticker-prompts";

describe("negative-prompt system", () => {
  it("includes the exact base negative prompt", () => {
    expect(BASE_NEGATIVE_PROMPT).toContain("multiple stickers");
    expect(BASE_NEGATIVE_PROMPT).toContain("sticker sheet");
    expect(BASE_NEGATIVE_PROMPT).toContain("checkerboard background");
    expect(BASE_NEGATIVE_PROMPT).toContain("contact sheet");
  });

  it("builds negative from base + style-specific + user additional", () => {
    const neg = buildNegativePrompt(
      STYLE_NEGATIVES["pixel-art"],
      undefined,
      undefined,
      "avoid sparkles",
    );
    expect(neg).toContain("multiple stickers");
    expect(neg).toContain("photorealism");
    expect(neg).toContain("avoid sparkles");
    // Base terms are never replaced by the user override.
    expect(neg).toContain("watermark");
  });

  it("never drops the built-in safety restrictions when a user override is present", () => {
    const withUser = buildNegativePrompt(undefined, undefined, undefined, "avoid text");
    expect(withUser).toContain("multiple stickers");
    expect(withUser).toContain("watermark");
    expect(withUser).toContain("floating parts");
    // The built-in text restriction is still present (base contains "text").
    expect(withUser).toContain("text");
  });
});

describe("buildStickerPrompt", () => {
  it("returns a separate positive and negative", () => {
    const out = buildStickerPrompt({
      theme: "coffee",
      style: "kawaii",
      itemName: "coffee mug",
    });
    expect(out.positive).toContain("a sticker of coffee mug");
    expect(out.positive).toContain("kawaii");
    expect(out.negative).toContain("multiple stickers");
    expect(out.positive).not.toContain("multiple stickers");
  });

  it("appends batch + item instructions and negatives", () => {
    const out = buildStickerPrompt({
      theme: "study",
      style: "flat",
      itemName: "pencil",
      batchInstructions: "keep it rounded",
      itemInstructions: "with a tiny eraser",
      batchNegative: "no wood grain",
      itemNegative: "no sparkles",
    });
    expect(out.positive).toContain("keep it rounded");
    expect(out.positive).toContain("tiny eraser");
    expect(out.negative).toContain("no wood grain");
    expect(out.negative).toContain("no sparkles");
  });

  it("does not treat multi-component items as duplicates", () => {
    const out = buildStickerPrompt({
      theme: "food",
      style: "cute-3d",
      itemName: "burger and fries",
    });
    // The item name must survive as a single subject reference.
    expect(out.positive).toContain("a sticker of burger and fries");
  });
});

describe("base positive prompt rules", () => {
  it("encourages a single isolated, centered subject with transparency", () => {
    const lower = BASE_STICKER_PROMPT.toLowerCase();
    expect(lower).toContain("one isolated");
    expect(lower).toContain("center");
    expect(lower).toContain("transparent");
    expect(lower).toContain("no text");
  });
});