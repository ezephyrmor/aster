import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { openrouterWorker } from "@/lib/ai/providers/openrouter";
import { googleWorker } from "@/lib/ai/providers/google";
import { openAiWorker } from "@/lib/ai/providers/openai";
import { PROVIDER_MODELS, isValidModel } from "@/lib/ai/models";

// The workers gate on their key at runtime — stub realistic keys so the tests
// exercise the real request-building (not the "not configured" path). Runs per
// test because the shared afterEach unstubs envs after each case.
beforeEach(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "sk-or-v1-test");
  vi.stubEnv("GOOGLE_API_KEY", "google-test-key");
  vi.stubEnv("OPENAI_API_KEY", "sk-test-openai");
});

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers({ "content-type": "application/json" }),
  } as unknown as Response;
}

function stubFetch(bodyOrBuffer: unknown | Buffer): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(() => {
    if (Buffer.isBuffer(bodyOrBuffer)) {
      return Promise.resolve({
        ok: true,
        status: 200,
        arrayBuffer: async () =>
          bodyOrBuffer.buffer.slice(bodyOrBuffer.byteOffset, bodyOrBuffer.byteOffset + bodyOrBuffer.byteLength),
        text: async () => "",
        json: async () => ({}),
        headers: new Headers(),
      } as unknown as Response);
    }
    return Promise.resolve(jsonResponse(200, bodyOrBuffer));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgAGWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const baseReq = {
  positivePrompt: "a cute cat sticker",
  negativePrompt: "text, watermark, hands",
  size: 512,
  transparent: true,
};

const imageResponse = () =>
  Promise.resolve({
    ok: true,
    status: 200,
    arrayBuffer: async () =>
      PNG_1x1.buffer.slice(PNG_1x1.byteOffset, PNG_1x1.byteOffset + PNG_1x1.byteLength),
    text: async () => "",
    json: async () => ({}),
    headers: new Headers(),
  } as unknown as Response);

describe("openrouterWorker", () => {
  function urlThenImageMock() {
    // Calls: [0] → generation JSON (with a URL), [1..] → image bytes.
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [{ url: "https://cdn.example.com/img.png" }] }))
      .mockImplementation(imageResponse);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("injects negatives into the prompt (no negative_prompt field) and requests a transparent PNG", async () => {
    const fetchMock = urlThenImageMock();

    const result = await openrouterWorker({
      ...baseReq,
      provider: "openrouter",
      model: "google/gemini-2.5-flash-image",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(url).toBe("https://openrouter.ai/api/v1/images/generations");
    // No stale negative_prompt field.
    expect(body).not.toHaveProperty("negative_prompt");
    // Negatives are injected into the positive prompt as hard instructions.
    expect(body.prompt).toContain("STRICTLY AVOID: text, watermark, hands");
    expect(body.model).toBe("google/gemini-2.5-flash-image");
    expect(body.n).toBe(1);
    expect(body.size).toBe("512x512");
    // Requesting a truly transparent PNG when the pack wants it.
    expect(body.output_format).toBe("png");
    expect(body.background).toBe("transparent");

    expect(result.buffer.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe("image/png");
  });

  it("omits transparent params when the pack requests an opaque image", async () => {
    const fetchMock = urlThenImageMock();

    await openrouterWorker({
      ...baseReq,
      transparent: false,
      provider: "openrouter",
      model: "google/gemini-2.5-flash-image",
    });
    const [, init] = fetchMock.mock.calls[0] as [unknown, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body).not.toHaveProperty("output_format");
    expect(body).not.toHaveProperty("background");
  });
});

describe("googleWorker", () => {
  it("uses generateContent with responseModalities IMAGE", async () => {
    const fetchMock = stubFetch({
      candidates: [
        {
          content: {
            parts: [{ inlineData: { mimeType: "image/png", data: PNG_1x1.toString("base64") } }],
          },
        },
      ],
    });

    const result = await googleWorker({
      ...baseReq,
      provider: "google",
      model: "gemini-3.1-flash-image",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    // Uses the modern generateContent endpoint (not the retired :predict path).
    expect(
      url.startsWith(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=",
      ),
    ).toBe(true);
    const body = JSON.parse(String(init.body));
    // Google has no native negative param — injected into prompt.
    expect(body.contents[0].parts[0].text).toContain("STRICTLY AVOID: text, watermark, hands");
    expect(body.generationConfig.responseModalities).toEqual(["IMAGE"]);
    // No legacy predict fields.
    expect(body).not.toHaveProperty("instances");
    expect(body).not.toHaveProperty("parameters");

    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it("resolves the current catalog model id", () => {
    expect(isValidModel("google", "gemini-3.1-flash-image")).toBe(true);
    expect(isValidModel("google", "imagen-3.0-generate-002")).toBe(false);
  });
});

describe("openAiWorker", () => {
  it("injects negatives and requests b64_json", async () => {
    const fetchMock = stubFetch({
      data: [{ b64_json: PNG_1x1.toString("base64") }],
    });

    const result = await openAiWorker({
      ...baseReq,
      provider: "openai",
      model: "gpt-image-1",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/images/generations");
    const body = JSON.parse(String(init.body));
    expect(body.prompt).toContain("STRICTLY AVOID: text, watermark, hands");
    expect(body.response_format).toBe("b64_json");
    expect(body.model).toBe("gpt-image-1");
    expect(result.buffer.length).toBeGreaterThan(0);
  });
});

describe("catalog coherence", () => {
  it("every openrouter and google model has an id and label", () => {
    for (const id of ["openrouter", "google"] as const) {
      for (const m of PROVIDER_MODELS[id]) {
        expect(m.id).toBeTruthy();
        expect(m.label).toBeTruthy();
        expect(["free", "free-tier", "paid"]).toContain(m.tier);
      }
    }
  });
});