import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx, loadTenantPack, PackNotFoundError } from "@/lib/ai/access";
import { StickerPackSchema, StickerItemSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/ai/stickers/pack/[id] — load a pack with items + assets
export const GET = withAuth(async (request: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id } = await context.params;
    const ctx = await getScopedCtx();
    const pack = await loadTenantPack(ctx, id);
    return NextResponse.json(pack);
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error loading sticker pack:", error);
    return NextResponse.json({ error: "Failed to load sticker pack" }, { status: 500 });
  }
});

// PATCH /api/ai/stickers/pack/[id] — update pack config and/or replace items
export const PATCH = withAuth(async (req: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id } = await context.params;
    const ctx = await getScopedCtx();
    await loadTenantPack(ctx, id); // enforce ownership

    const body = await req.json();
    const packParsed = StickerPackSchema.partial().safeParse(body);
    if (!packParsed.success) {
      return NextResponse.json({ error: "Invalid pack update", details: packParsed.error.flatten() }, { status: 400 });
    }

    if (Object.keys(body ?? {}).some((k) => k !== "items")) {
      const { items: _omit, ...packData } = body as Record<string, unknown>;
      void _omit;
      await ctx.prisma.stickerPack.update({
        where: { id },
        data: {
          ...(packData.theme !== undefined ? { theme: String(packData.theme) } : {}),
          ...(packData.style !== undefined ? { style: String(packData.style) } : {}),
          ...(packData.name !== undefined ? { name: String(packData.name) } : {}),
          ...(packData.provider !== undefined ? { provider: String(packData.provider) } : {}),
          ...(packData.model !== undefined ? { model: packData.model === null ? null : String(packData.model) } : {}),
          ...(packData.transparent !== undefined ? { transparent: Boolean(packData.transparent) } : {}),
          ...(packData.outline !== undefined ? { outline: Boolean(packData.outline) } : {}),
          ...(packData.outlineStrength !== undefined
            ? { outlineStrength: String(packData.outlineStrength) }
            : {}),
          ...(packData.count !== undefined ? { count: Number(packData.count) } : {}),
          ...(packData.size !== undefined ? { size: Number(packData.size) } : {}),
          ...(packData.batchInstructions !== undefined ? { batchInstructions: String(packData.batchInstructions) } : {}),
          ...(packData.negativePrompt !== undefined ? { negativePrompt: String(packData.negativePrompt) } : {}),
        },
      });
    }

    if (body?.items !== undefined) {
      const itemsParsed = await StickerItemSchema.partial().array().safeParseAsync(body.items);
      if (!itemsParsed.success) {
        return NextResponse.json({ error: "Invalid items", details: itemsParsed.error.flatten() }, { status: 400 });
      }
      // Replace the item set wholesale (keeps ids when present).
      await ctx.prisma.$transaction(async (tx) => {
        await tx.stickerItem.deleteMany({ where: { packId: id } });
        await tx.stickerItem.createMany({
          data: itemsParsed.data.map((it, i) => ({
            packId: id,
            companyId: ctx.companyId,
            name: String(it.name),
            instructions: it.instructions ? String(it.instructions) : null,
            negativeInstructions: it.negativeInstructions ? String(it.negativeInstructions) : null,
            status: "pending",
            sortOrder: i,
          })),
        });
      });
    }

    const full = await loadTenantPack(ctx, id);
    return NextResponse.json(full);
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error updating sticker pack:", error);
    return NextResponse.json({ error: "Failed to update sticker pack" }, { status: 500 });
  }
});

// DELETE /api/ai/stickers/pack/[id] — delete a pack
export const DELETE = withAuth(async (req: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id } = await context.params;
    const ctx = await getScopedCtx();
    await loadTenantPack(ctx, id);
    await ctx.prisma.stickerPack.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error deleting sticker pack:", error);
    return NextResponse.json({ error: "Failed to delete sticker pack" }, { status: 500 });
  }
});