import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/ai/stickers/pack/route";

const mocks = vi.hoisted(() => ({
  packCount: vi.fn(),
  packFindMany: vi.fn(),
}));
const { packCount, packFindMany } = mocks;

vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => (request: Request) => handler(request, {}, {})),
}));

vi.mock("@/lib/ai/access", () => ({
  getScopedCtx: vi.fn(async () => ({
    companyId: "c1",
    userId: "u1",
    prisma: {
      stickerPack: {
        count: mocks.packCount,
        findMany: mocks.packFindMany,
      },
    },
  })),
}));

vi.mock("@/lib/validations", () => ({
  StickerPackSchema: {},
  StickerItemSchema: {},
}));

const listPacks = GET as unknown as (request: Request) => Promise<Response>;

describe("GET /api/ai/stickers/pack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns a paginated pack list with tenant scoping", async () => {
    packCount.mockResolvedValue(27);
    packFindMany.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);

    const res = await listPacks(
      new Request("http://localhost:3000/api/ai/stickers/pack?page=3&limit=2"),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.packs).toHaveLength(2);
    expect(data.pagination).toEqual({
      total: 27,
      page: 3,
      limit: 2,
      totalPages: 14,
    });

    // Tenant scoping auto-injected (companyId must be in the where clause).
    expect(packCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "c1" } }),
    );
    expect(packFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: "c1" },
        orderBy: { createdAt: "desc" },
        skip: 4,
        take: 2,
      }),
    );
  });

  it("defaults to page 1 with a sensible limit when no params are given", async () => {
    packCount.mockResolvedValue(5);
    packFindMany.mockResolvedValue([{ id: "p1" }]);

    await listPacks(new Request("http://localhost:3000/api/ai/stickers/pack"));
    expect(packFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 12 }),
    );
  });

  it("returns 500 on a DB error", async () => {
    packCount.mockRejectedValue(new Error("db"));
    const res = await listPacks(new Request("http://localhost:3000/api/ai/stickers/pack"));
    expect(res.status).toBe(500);
  });
});