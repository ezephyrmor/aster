import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx } from "@/lib/ai/access";
import { StickerPackSchema, StickerItemSchema } from "@/lib/validations";

// POST /api/ai/stickers/pack — create a new pack (with optional items)
export const POST = withAuth(async (request: NextRequest, _ctx: unknown, _auth: unknown) => {
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
        model: parsed.data.model ?? null,
        count: items.length || parsed.data.count,
        size: parsed.data.size,
        transparent: parsed.data.transparent,
        outline: parsed.data.outline || parsed.data.outlineStrength !== "none",
        outlineStrength: parsed.data.outlineStrength,
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
      include: {
        items: {
          include: { asset: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json(full, { status: 201 });
  } catch (error) {
    console.error("Error creating sticker pack:", error);
    return NextResponse.json({ error: "Failed to create sticker pack" }, { status: 500 });
  }
});

// GET /api/ai/stickers/pack — list packs for the tenant (paginated)
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
    const total = await ctx.prisma.stickerPack.count({ where });
    const packs = await ctx.prisma.stickerPack.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { items: true } },
      },
    });
    return NextResponse.json({
      packs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error listing sticker packs:", error);
    return NextResponse.json({ error: "Failed to list sticker packs" }, { status: 500 });
  }
});