import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx } from "@/lib/ai/access";

// GET /api/ai/stickers/errors — paginated log of failed sticker generations
// for the tenant. Reads the durable `sticker_error_logs` table so entries
// survive even when a pack whose entire batch failed is auto-discarded (which
// would otherwise cascade-delete the per-item error rows).
export const GET = withAuth(async (request: NextRequest, _ctx: unknown, _auth: unknown) => {
  try {
    const ctx = await getScopedCtx();
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("limit") ?? "12", 10) || 12),
    );

    const where = { companyId: ctx.companyId };
    const total = await ctx.prisma.stickerErrorLog.count({ where });
    const entries = await ctx.prisma.stickerErrorLog.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        sticker: true,
        error: true,
        packId: true,
        packName: true,
        theme: true,
        provider: true,
        updatedAt: true,
      },
    });

    const logs = (entries as Array<{
      id: string;
      sticker: string;
      error: string;
      packId: string | null;
      packName: string | null;
      theme: string | null;
      provider: string;
      updatedAt: Date;
    }>).map((e) => ({
      id: e.id,
      sticker: e.sticker,
      status: "failed",
      error: e.error ?? "Unknown generation error",
      packId: e.packId,
      packName: e.packName ?? "Unknown pack",
      theme: e.theme ?? "",
      provider: e.provider ?? "mock",
      updatedAt: (e.updatedAt as Date).toISOString(),
    }));

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error listing sticker generation errors:", error);
    return NextResponse.json({ error: "Failed to list generation errors" }, { status: 500 });
  }
});