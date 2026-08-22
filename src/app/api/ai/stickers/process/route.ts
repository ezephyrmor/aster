import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx, loadTenantPack, PackNotFoundError } from "@/lib/ai/access";
import { StickerGenerateSchema } from "@/lib/validations";
import { generateOneSticker, publicErrorMessage } from "@/lib/ai/stickers";
import type { StickerProviderName } from "@/lib/ai/provider";

// POST /api/ai/stickers/process — generate + process ONE sticker item
// and persist the processed PNG. One item → one AI call → one transparent PNG.
export const POST = withAuth(async (req: NextRequest, _ctx: any, _auth: any) => {
  try {
    const ctx = await getScopedCtx();
    const body = await req.json();

    const parsed = StickerGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }
    const { packId, itemId } = parsed.data;

    const pack = await loadTenantPack(ctx, packId);
    const item = pack.items.find((it) => it.id === itemId);
    if (!item) {
      // Debuggable without leaking internals: distinguishes an empty pack from
      // a stale/mismatched itemId (e.g. an id from a previous pack).
      return NextResponse.json(
        {
          error:
            pack.items.length === 0
              ? "This pack has no sticker items — please re-create the batch."
              : "Sticker item not found in this pack (it may belong to an earlier pack). Please regenerate the batch.",
        },
        { status: 404 },
      );
    }

    // Mark as generating.
    await ctx.prisma.stickerItem.update({
      where: { id: itemId },
      data: { status: "generating", error: null },
    });

    try {
      const result = await generateOneSticker({
        provider: pack.provider as StickerProviderName,
        itemName: item.name,
        pack: {
          theme: pack.theme,
          style: pack.style,
          size: pack.size,
          transparent: pack.transparent,
          outline: pack.outline,
          batchInstructions: pack.batchInstructions,
          negativePrompt: pack.negativePrompt,
        },
        item: {
          instructions: item.instructions,
          negativeInstructions: item.negativeInstructions,
        },
      });

      // Persist the processed PNG, replacing any previous asset.
      await ctx.prisma.$transaction(async (tx) => {
        await tx.stickerAsset.deleteMany({ where: { itemId } });
        await tx.stickerAsset.create({
          data: {
            itemId,
            packId,
            companyId: ctx.companyId,
            filename: result.filename,
            mime: result.mimeType,
            width: result.width,
            height: result.height,
            data: result.buffer,
            metadata: { provider: pack.provider },
          },
        });
      });

      await ctx.prisma.stickerItem.update({
        where: { id: itemId },
        data: { status: "completed", error: null },
      });

      return NextResponse.json({
        ok: true,
        itemId,
        filename: result.filename,
        width: result.width,
        height: result.height,
        imageData: result.buffer.toString("base64"),
      });
    } catch (err) {
      await ctx.prisma.stickerItem.update({
        where: { id: itemId },
        data: { status: "failed", error: publicErrorMessage(err) },
      });
      return NextResponse.json({ error: publicErrorMessage(err) }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Sticker generation error:", error);
    return NextResponse.json({ error: "Failed to generate sticker" }, { status: 500 });
  }
});