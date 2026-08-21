import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx, loadTenantPack, PackNotFoundError } from "@/lib/ai/access";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

// GET /api/ai/stickers/pack/[id]/asset/[itemId] — download one processed PNG
export const GET = withAuth(async (_req: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id, itemId } = await context.params;
    const ctx = await getScopedCtx();
    const pack = await loadTenantPack(ctx, id);
    const asset = pack.assets.find((a) => a.itemId === itemId);
    if (!asset) {
      return NextResponse.json({ error: "Sticker not generated yet" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(asset.data), {
      headers: {
        "Content-Type": asset.mime,
        "Content-Disposition": `attachment; filename="${asset.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error downloading sticker:", error);
    return NextResponse.json({ error: "Failed to download sticker" }, { status: 500 });
  }
});

// DELETE /api/ai/stickers/pack/[id]/asset/[itemId] — remove one sticker's asset
export const DELETE = withAuth(async (_req: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id, itemId } = await context.params;
    const ctx = await getScopedCtx();
    const pack = await loadTenantPack(ctx, id);
    if (!pack.assets.some((a) => a.itemId === itemId)) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
    }
    await ctx.prisma.stickerAsset.delete({ where: { itemId } });
    await ctx.prisma.stickerItem.update({
      where: { id: itemId },
      data: { status: "pending", error: null },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error deleting sticker:", error);
    return NextResponse.json({ error: "Failed to delete sticker" }, { status: 500 });
  }
});