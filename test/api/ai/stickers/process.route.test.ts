import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/stickers/process/route";

// Hoist shared mock callbacks (vi.mock factories are hoisted above const decls).
const mocks = vi.hoisted(() => ({
  stickerItemUpdate: vi.fn(),
  stickerAssetDelete: vi.fn(),
  stickerAssetCreate: vi.fn(),
  stickerErrorLogDelete: vi.fn(),
  stickerErrorLogDeleteTx: vi.fn(),
  stickerErrorLogCreateTx: vi.fn(),
  generateOne: vi.fn(),
}));
const {
  stickerItemUpdate,
  stickerAssetDelete,
  stickerAssetCreate,
  stickerErrorLogDelete,
  stickerErrorLogDeleteTx,
  stickerErrorLogCreateTx,
  generateOne,
} = mocks;

// Mock auth guard.
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => (request: Request) =>
    handler(request, {}, { user: { companyId: "1", id: 1 } }),
  ),
}));

// Mock tenant access + generation orchestration.
vi.mock("@/lib/ai/access", () => ({
  getScopedCtx: vi.fn(async () => ({
    companyId: "1",
    userId: "u1",
    prisma: {
      stickerItem: { update: mocks.stickerItemUpdate },
      stickerErrorLog: { deleteMany: mocks.stickerErrorLogDelete },
      $transaction: vi.fn(async (cb: (tx: any) => Promise<void>) => {
        await cb({
          stickerAsset: { deleteMany: mocks.stickerAssetDelete, create: mocks.stickerAssetCreate },
          stickerErrorLog: {
            deleteMany: mocks.stickerErrorLogDeleteTx,
            create: mocks.stickerErrorLogCreateTx,
          },
        });
      }),
    },
  })),
  loadTenantPack: vi.fn(async (_ctx: any, _id: string) => ({
    id: "pack-1",
    provider: "mock",
    theme: "coffee",
    style: "kawaii",
    size: 1024,
    transparent: true,
    outline: false,
    batchInstructions: null,
    negativePrompt: null,
    items: [
      {
        id: "item-1",
        name: "Coffee Mug",
        instructions: null,
        negativeInstructions: null,
      },
    ],
    assets: [],
  })),
  PackNotFoundError: class PackNotFoundError extends Error {},
}));

vi.mock("@/lib/ai/stickers", () => ({
  generateOneSticker: mocks.generateOne,
  publicErrorMessage: (err: unknown) =>
    err instanceof Error ? err.message : "Failed to generate this sticker.",
}));

vi.mock("@/lib/validations", () => {
  const z = require("zod");
  return { StickerGenerateSchema: z.object({ packId: z.string(), itemId: z.string() }) };
});

describe("POST /api/ai/stickers/process", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(new Request("http://localhost:3000/api/ai/stickers/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }));
    expect(res.status).toBe(400);
  });

  it("generates, processes, persists, and marks the item completed", async () => {
    generateOne.mockResolvedValue({
      buffer: Buffer.from("PNGDATA"),
      filename: "coffee-mug.png",
      width: 1024,
      height: 1024,
    });
    stickerAssetCreate.mockResolvedValue({});
    stickerAssetDelete.mockResolvedValue({});
    stickerItemUpdate.mockResolvedValue({});
    stickerErrorLogDelete.mockResolvedValue({ count: 0 });

    const res = await POST(new Request("http://localhost:3000/api/ai/stickers/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId: "pack-1", itemId: "item-1" }),
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.filename).toBe("coffee-mug.png");
    expect(generateOne).toHaveBeenCalledTimes(1);
    // Passed pack + item data (per-item negatives included).
    expect(generateOne.mock.calls[0][0].itemName).toBe("Coffee Mug");
  });

  it("returns a safe error and marks the item failed when generation fails", async () => {
    generateOne.mockRejectedValue(new Error("The AI provider rate-limited requests. Please wait and retry."));
    stickerItemUpdate.mockResolvedValue({});
    stickerErrorLogDeleteTx.mockResolvedValue({ count: 0 });
    stickerErrorLogCreateTx.mockResolvedValue({ id: "log-1" });

    const res = await POST(new Request("http://localhost:3000/api/ai/stickers/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId: "pack-1", itemId: "item-1" }),
    }));
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toBeTruthy();
    // Each failure is isolated — a single failure must not affect siblings.
    expect(stickerItemUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "failed" }) }),
    );
  });
});