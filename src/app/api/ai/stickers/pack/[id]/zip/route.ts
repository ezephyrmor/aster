import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { getScopedCtx, loadTenantPack, PackNotFoundError } from "@/lib/ai/access";
import { buildPackZip } from "@/lib/ai/zip";
import { dedupeFilenames } from "@/lib/ai/filename";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/ai/stickers/pack/[id]/zip — Download All as ZIP (only completed stickers)
export const GET = withAuth(async (_req: NextRequest, context: Ctx, _auth: any) => {
  try {
    const { id } = await context.params;
    const ctx = await getScopedCtx();
    const pack = await loadTenantPack(ctx, id);

    const completed = pack.items.filter((it) => it.status === "completed" && it.asset);
    if (completed.length === 0) {
      return NextResponse.json({ error: "No completed stickers to download" }, { status: 400 });
    }

    // Dedupe filenames server-side (never trust client names).
    const filenameMap = dedupeFilenames(
      completed.map((it) => ({ id: it.id, filename: it.asset!.filename })),
    );

    const zip = await buildPackZip({
      pack: {
        name: pack.name,
        theme: pack.theme,
        style: pack.style,
        transparent: pack.transparent,
      },
      canvasSize: pack.size,
      stickers: completed.map((it) => ({
        id: it.id,
        name: it.name,
        filename: filenameMap.get(it.id) ?? it.asset!.filename,
        data: it.asset!.data,
      })),
    });

    const packSlug = pack.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return new NextResponse(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packSlug || "stickers"}.zip"`,
      },
    });
  } catch (error) {
    if (error instanceof PackNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error building sticker zip:", error);
    return NextResponse.json({ error: "Failed to build sticker pack zip" }, { status: 500 });
  }
});