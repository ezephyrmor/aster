import { describe, it, expect, vi, afterEach } from "vitest";
import {
  extractFirstB64,
  extractFirstImageUrl,
  generateSticker,
  supportsNativeNegative,
  STICKER_PROVIDERS,
} from "@/lib/ai/provider";
import { defaultModelFor, isValidModel, PROVIDER_MODELS, resolveModel } from "@/lib/ai/models";

// Stub the Hugging Face SDK so the fallback provider can be made to fail
// without a network call. Only the HF worker dynamically imports this, and
// other tests in this file delete HUGGINGFACE_API_KEY so they never reach it.
vi.mock("@huggingface/inference", () => ({
  InferenceClient: class {
    textToImage() {
      throw new Error("You have depleted your monthly included credits.");
    }
  },
}));

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
    headers: new Headers(),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});


describe("supportsNativeNegative", () => {
  it("maps stability and huggingface to native negative support", () => {
    expect(supportsNativeNegative("stability")).toBe(true);
    expect(supportsNativeNegative("huggingface")).toBe(true);
  });

  it("does not claim native negatives for text-injection providers", () => {
    // OpenRouter's image API has no negative_prompt field — negatives are
    // injected into the prompt, same as OpenAI and Google/Imagen.
    expect(supportsNativeNegative("openai")).toBe(false);
    expect(supportsNativeNegative("google")).toBe(false);
    expect(supportsNativeNegative("openrouter")).toBe(false);
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
    for (const p of [
      "openai",
      "stability",
      "google",
      "openrouter",
      "huggingface",
      "mock",
    ]) {
      expect(STICKER_PROVIDERS).toContain(p);
    }
  });
});

describe("extractFirstImageUrl", () => {
  it("finds an image URL in nested JSON (OpenRouter-style)", () => {
    const json = { data: [{ url: "https://cdn.example.com/img/flux-1.png?x=1" }] };
    expect(extractFirstImageUrl(json)).toBe("https://cdn.example.com/img/flux-1.png?x=1");
  });

  it("returns null when only base64 is present", () => {
    expect(extractFirstImageUrl({ data: [{ b64_json: "AAAA==" }] })).toBeNull();
  });

  it("does not match non-image URLs", () => {
    expect(extractFirstImageUrl("https://example.com/page")).toBeNull();
  });
});

describe("model catalog", () => {
  it("categorizes every provider with at least one model", () => {
    for (const p of STICKER_PROVIDERS) {
      expect(PROVIDER_MODELS[p].length).toBeGreaterThan(0);
      for (const m of PROVIDER_MODELS[p]) {
        expect(["free", "free-tier", "paid"]).toContain(m.tier);
      }
    }
  });

  it("offers a truly free model for huggingface and none for openrouter", () => {
    expect(PROVIDER_MODELS.huggingface.some((m) => m.tier === "free")).toBe(true);
    expect(PROVIDER_MODELS.openrouter.every((m) => m.tier === "paid")).toBe(true);
  });

  it("validates model ids against the provider allowlist", () => {
    expect(isValidModel("openrouter", "google/gemini-2.5-flash-image")).toBe(true);
    expect(isValidModel("openrouter", "black-forest-labs/flux-1.1-pro")).toBe(false);
    expect(isValidModel("huggingface", "google/gemini-2.5-flash-image")).toBe(false);
  });

  it("resolveModel prefers request → env → default and falls back on unknown ids", () => {
    expect(resolveModel("openrouter", "openai/gpt-5-image")).toBe("openai/gpt-5-image");
    vi.stubEnv("AI_MODEL", "google/gemini-3-pro-image");
    expect(resolveModel("openrouter")).toBe("google/gemini-3-pro-image");
    expect(resolveModel("openrouter", "made-up/model")).toBe(defaultModelFor("openrouter"));
  });
});

describe("generateSticker fallback", () => {
  const baseReq = {
    positivePrompt: "a cute cat sticker",
    size: 512,
    transparent: true,
  };

  function stubSequence(responses: Response[]) {
    let i = 0;
    const fetchMock = vi.fn(() =>
      Promise.resolve(responses[Math.min(i++, responses.length - 1)]),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("falls back to a configured free provider on hard failures (402)", async () => {
    // OpenRouter: 402 → HF worker uses @huggingface/inference, not fetch; stub
    // env so only google remains reachable via fetch.
    vi.stubEnv("OPENROUTER_API_KEY", "sk-or-v1-test");
    vi.stubEnv("GOOGLE_API_KEY", "google-key");
    delete (process.env as Record<string, unknown>).HUGGINGFACE_API_KEY;
    const fetchMock = stubSequence([
      mockResponse(402, { error: { message: "Insufficient credits" } }),
      mockResponse(200, {
        predictions: [
          { bytesBase64Encoded: "AAAAAAABBBBBBCCCCCCDDDDDDEEEEEEFFFFGGGG==" },
        ],
      }),
    ]);

    const result = await generateSticker({
      ...baseReq,
      provider: "openrouter",
      model: "google/gemini-2.5-flash-image",
    });
    expect(result.provider).toBe("google");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 15_000);

  it("does not fall back on transient errors (timeout / rate-limit)", async () => {
    vi.stubEnv("GOOGLE_API_KEY", "google-key");
    delete (process.env as Record<string, unknown>).HUGGINGFACE_API_KEY;
    const fetchMock = stubSequence([
      mockResponse(429, { error: { message: "Rate limited" } }),
    ]);

    await expect(
      generateSticker({ ...baseReq, provider: "google" }),
    ).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  }, 15_000);

  it("reports the requested provider when it succeeds directly", async () => {
    const result = await generateSticker({ ...baseReq, provider: "mock" });
    expect(result.provider).toBe("mock");
    expect(result.buffer.length).toBeGreaterThan(0);
  }, 15_000);

  it("attributes the failure to the chosen provider when the free fallback also fails", async () => {
    // User picks Google (no Google key configured → hard "not configured" error).
    vi.stubEnv("GOOGLE_API_KEY", "");
    // Hugging Face is configured and reachable, but it fails (credits depleted) —
    // its failure must NOT be surfaced in place of Google's.
    vi.stubEnv("HUGGINGFACE_API_KEY", "hf_fake");
    delete (process.env as Record<string, unknown>).OPENROUTER_API_KEY;

    await expect(
      generateSticker({
        ...baseReq,
        provider: "google",
        model: "imagen-3.0-generate-002",
      }),
    ).rejects.toMatchObject({
      name: "ProviderError",
      kind: "not-configured",
      message: expect.stringContaining("Google"),
    });
  }, 15_000);
});