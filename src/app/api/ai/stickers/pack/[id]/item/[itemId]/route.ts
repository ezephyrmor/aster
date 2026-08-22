import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx, loadTenantPack, PackNotFoundError } from "@/lib/ai/access";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

const UpdateStickerItemSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  instructions: z.string().trim().max(400).optional(),
  negativeInstructions: z.string().trim().max(300).optional(),
});

// PUT /api/ai/stickers/pack/[id]/item/[itemId] — update ONE item in place
// (keeps its id stable so regeneration targets the same sticker).
export const PUT = withAuth(async (req: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id, itemId } = await context.params;
    const ctx = await getScopedCtx();
    await loadTenantPack(ctx, id); // enforce pack ownership

    const body = await req.json();
    const parsed = UpdateStickerItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid item update", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    // Guard: unique (packId, name) — renaming onto an existing sibling fails.
    const updated = await ctx.prisma.stickerItem
      .update({
        where: { id: itemId },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.instructions !== undefined
            ? { instructions: parsed.data.instructions || null }
            : {}),
          ...(parsed.data.negativeInstructions !== undefined
            ? { negativeInstructions: parsed.data.negativeInstructions || null }
            : {}),
        },
      })
      .catch(() => null);

    if (!updated) {
      return NextResponse.json({ error: "An item with that name already exists" }, { status: 409 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error updating sticker item:", error);
    return NextResponse.json({ error: "Failed to update sticker item" }, { status: 500 });
  }
});