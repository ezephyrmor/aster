import { describe, it, expect } from "vitest";
import { shouldDiscardFailedBatch } from "@/components/sticker-generator/discard-decision";

describe("shouldDiscardFailedBatch", () => {
  it("keeps the pack when at least one sticker succeeded", () => {
    // 1 success, many failures → keep (user: "don't delete if one got generated").
    expect(shouldDiscardFailedBatch(1, 5)).toBe(false);
    expect(shouldDiscardFailedBatch(2, 2)).toBe(false);
    expect(shouldDiscardFailedBatch(4, 2)).toBe(false);
  });

  it("discards the pack only when every generation failed", () => {
    expect(shouldDiscardFailedBatch(0, 1)).toBe(true);
    expect(shouldDiscardFailedBatch(0, 6)).toBe(true);
  });

  it("keeps an empty batch (nothing to discard)", () => {
    expect(shouldDiscardFailedBatch(0, 0)).toBe(false);
  });
});