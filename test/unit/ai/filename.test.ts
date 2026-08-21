import { describe, it, expect } from "vitest";
import { slugifyName, stickerFilename, dedupeFilenames } from "@/lib/ai/filename";

describe("slugifyName", () => {
  it("slugifies a display name", () => {
    expect(slugifyName("Coffee Mug")).toBe("coffee-mug");
    expect(slugifyName("B&P's Café!")).toBe("b-p-s-caf");
  });

  it("falls back to a safe default when empty", () => {
    expect(slugifyName("")).toBe("sticker");
    expect(slugifyName("   ")).toBe("sticker");
  });
});

describe("stickerFilename", () => {
  it("produces a clean png filename", () => {
    expect(stickerFilename("Coffee Mug")).toBe("coffee-mug.png");
  });

  it("produces a json filename", () => {
    expect(stickerFilename("pack", "json")).toBe("pack.json");
  });
});

describe("dedupeFilenames", () => {
  it("appends numeric suffixes to dupes", () => {
    const map = dedupeFilenames([
      { id: "a", filename: "coffee.png" },
      { id: "b", filename: "coffee.png" },
      { id: "c", filename: "coffee.png" },
    ]);
    expect(map.get("a")).toBe("coffee.png");
    expect(map.get("b")).toBe("coffee-2.png");
    expect(map.get("c")).toBe("coffee-3.png");
  });

  it("keeps unique names intact", () => {
    const map = dedupeFilenames([
      { id: "a", filename: "coffee.png" },
      { id: "b", filename: "mug.png" },
    ]);
    expect(map.get("b")).toBe("mug.png");
  });
});