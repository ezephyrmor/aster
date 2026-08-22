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
      { id: "openai", configured: false },
      { id: "openrouter", configured: true },
      { id: "mock", configured: true },
    ]);
  });
});