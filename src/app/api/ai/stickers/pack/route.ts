import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx } from "@/lib/ai/access";
import { StickerPackSchema, StickerItemSchema } from "@/lib/validations";

// POST /api/ai/stickers/pack — create a new pack (with optional items)
export const POST = withAuth(async (request: NextRequest, _ctx: any, _auth: any) => {
  try {
    const ctx = await getScopedCtx();
    const body = await request.json();

    const parsed = StickerPackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid sticker pack configuration", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let items: z.infer<typeof StickerItemSchema>[] = [];
    if (body?.items !== undefined) {
      const itemsResult = StickerItemSchema.array().safeParse(body.items);
      if (!itemsResult.success) {
        return NextResponse.json(
          { error: "Invalid sticker items", details: itemsResult.error.flatten() },
          { status: 400 },
        );
      }
      items = itemsResult.data;
    }

    const pack = await ctx.prisma.stickerPack.create({
      data: {
        companyId: ctx.companyId,
        createdById: ctx.userId,
        name: parsed.data.name,
        theme: parsed.data.theme,
        style: parsed.data.style,
        provider: parsed.data.provider ?? "mock",
        count: parsed.data.count,
        size: parsed.data.size,
        transparent: parsed.data.transparent,
        outline: parsed.data.outline,
        batchInstructions: parsed.data.batchInstructions ?? null,
        negativePrompt: parsed.data.negativePrompt ?? null,
      },
    });

    if (items.length > 0) {
      await ctx.prisma.stickerItem.createMany({
        data: items.map((it, i) => ({
          packId: pack.id,
          companyId: ctx.companyId,
          name: it.name,
          instructions: it.instructions ?? null,
          negativeInstructions: it.negativeInstructions ?? null,
          status: "pending",
          sortOrder: i,
        })),
      });
    }

    const full = await ctx.prisma.stickerPack.findFirst({
      where: { id: pack.id, companyId: ctx.companyId },
      include: { items: { include: { asset: true } } },
    });

    return NextResponse.json(full, { status: 201 });
  } catch (error) {
    console.error("Error creating sticker pack:", error);
    return NextResponse.json({ error: "Failed to create sticker pack" }, { status: 500 });
  }
});

// GET /api/ai/stickers/pack — list packs for the tenant
export const GET = withAuth(async (request: NextRequest, _ctx: any, _auth: any) => {
  try {
    const ctx = await getScopedCtx();
    const packs = await ctx.prisma.stickerPack.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
      },
    });
    return NextResponse.json({ packs });
  } catch (error) {
    console.error("Error listing sticker packs:", error);
    return NextResponse.json({ error: "Failed to list sticker packs" }, { status: 500 });
  }
});