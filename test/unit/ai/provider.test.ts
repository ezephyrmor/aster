import { describe, it, expect } from "vitest";
import {
  extractFirstB64,
  supportsNativeNegative,
  STICKER_PROVIDERS,
} from "@/lib/ai/provider";

describe("supportsNativeNegative", () => {
  it("maps stability and openrouter to native negative support", () => {
    expect(supportsNativeNegative("stability")).toBe(true);
    expect(supportsNativeNegative("openrouter")).toBe(true);
  });

  it("does not claim native negatives for text-injection providers", () => {
    expect(supportsNativeNegative("openai")).toBe(false);
    expect(supportsNativeNegative("google")).toBe(false);
    expect(supportsNativeNegative("mock")).toBe(false);
  });
});

describe("extractFirstB64", () => {
  it("finds a bare base64 string", () => {
    const b64 = "AAAAAAABBBBBBCCCCCCDDDDDDEEEEEE==";
    expect(extractFirstB64(b64)).toBe(b64);
  });

  it("finds a data URI value", () => {
    const dataUri = "data:image/png;base64,AAAAABBBBBBCCCCDDDDEEEE==";
    expect(extractFirstB64(dataUri)).toBe("AAAAABBBBBBCCCCDDDDEEEE==");
  });

  it("recurses through nested JSON", () => {
    const json = {
      data: [{ b64_json: "MTIzNDU2Nzg5MGFiY2RlZiEH" }],
    };
    expect(extractFirstB64(json)).toBe("MTIzNDU2Nzg5MGFiY2RlZiEH");
  });
});

describe("STICKER_PROVIDERS", () => {
  it("includes every supported provider + mock", () => {
    for (const p of ["openai", "stability", "google", "openrouter", "mock"]) {
      expect(STICKER_PROVIDERS).toContain(p);
    }
  });
});