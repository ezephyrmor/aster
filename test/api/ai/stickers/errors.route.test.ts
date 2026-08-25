import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/ai/stickers/errors/route";

const mocks = vi.hoisted(() => ({
  logCount: vi.fn(),
  logFindMany: vi.fn(),
}));
const { logCount, logFindMany } = mocks;

vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => (request: Request) => handler(request, {}, {})),
}));

vi.mock("@/lib/ai/access", () => ({
  getScopedCtx: vi.fn(async () => ({
    companyId: "c1",
    userId: "u1",
    prisma: {
      stickerErrorLog: {
        count: mocks.logCount,
        findMany: mocks.logFindMany,
      },
    },
  })),
}));

const listErrors = GET as unknown as (request: Request) => Promise<Response>;

describe("GET /api/ai/stickers/errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns a paginated error log with tenant scoping", async () => {
    logCount.mockResolvedValue(5);
    logFindMany.mockResolvedValue([
      {
        id: "i1",
        sticker: "Coffee Mug",
        error: "Google rate limited",
        packId: "p1",
        packName: "Cozy Coffee",
        theme: "coffee",
        provider: "google",
        updatedAt: new Date("2026-01-02T03:04:05Z"),
      },
    ]);

    const res = await listErrors(
      new Request("http://localhost:3000/api/ai/stickers/errors?page=1&limit=5"),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.logs).toEqual([
      {
        id: "i1",
        sticker: "Coffee Mug",
        status: "failed",
        error: "Google rate limited",
        packId: "p1",
        packName: "Cozy Coffee",
        theme: "coffee",
        provider: "google",
        updatedAt: new Date("2026-01-02T03:04:05Z").toISOString(),
      },
    ]);
    expect(data.pagination).toEqual({ total: 5, page: 1, limit: 5, totalPages: 1 });

    // Tenant scoping (companyId must be in the where clause).
    expect(logCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "c1" } }),
    );
    expect(logFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: "c1" },
        orderBy: { updatedAt: "desc" },
        skip: 0,
        take: 5,
      }),
    );
  });

  it("returns empty logs when nothing failed", async () => {
    logCount.mockResolvedValue(0);
    logFindMany.mockResolvedValue([]);
    const res = await listErrors(new Request("http://localhost:3000/api/ai/stickers/errors"));
    const data = await res.json();
    expect(data.logs).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it("returns 500 on a DB error", async () => {
    logCount.mockRejectedValue(new Error("db"));
    const res = await listErrors(new Request("http://localhost:3000/api/ai/stickers/errors"));
    expect(res.status).toBe(500);
  });
});