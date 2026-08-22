import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/ai/stickers/providers/route";

vi.mock("@/lib/api-auth", () => ({
  withAuth:
    (handler: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) =>
      handler(...args),
}));

vi.mock("@/lib/ai/provider", () => ({
  STICKER_PROVIDERS: ["openai", "openrouter", "mock"],
  // Only mock + openrouter have keys in this scenario.
  isProviderConfigured: (p: string) => p === "mock" || p === "openrouter",
}));

vi.mock("@/lib/ai/models", () => ({
  PROVIDER_MODELS: {
    openai: [{ id: "gpt-image-1", label: "GPT Image 1", tier: "paid" }],
    openrouter: [
      { id: "google/gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image", tier: "paid" },
    ],
    mock: [{ id: "mock", label: "Placeholder renderer", tier: "free" }],
  },
  defaultModelFor: (p: string) =>
    p === "openai" ? "gpt-image-1" : p === "openrouter" ? "google/gemini-2.5-flash-image" : "mock",
}));

describe("GET /api/ai/stickers/providers", () => {
  beforeEach(() => {
    vi.stubEnv("AI_PROVIDER", "openrouter");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns each provider with its configured flag and the env default", async () => {
    const res = await (GET as unknown as () => Response)();
    const data = await res.json();

    expect(data.defaultProvider).toBe("openrouter");
    expect(data.providers).toEqual([
      {
        id: "openai",
        configured: false,
        models: [{ id: "gpt-image-1", label: "GPT Image 1", tier: "paid" }],
        defaultModel: "gpt-image-1",
      },
      {
        id: "openrouter",
        configured: true,
        models: [
          {
            id: "google/gemini-2.5-flash-image",
            label: "Gemini 2.5 Flash Image",
            tier: "paid",
          },
        ],
        defaultModel: "google/gemini-2.5-flash-image",
      },
      {
        id: "mock",
        configured: true,
        models: [{ id: "mock", label: "Placeholder renderer", tier: "free" }],
        defaultModel: "mock",
      },
    ]);
  });
});