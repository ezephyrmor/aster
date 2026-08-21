import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { StickerSuggestSchema } from "@/lib/validations";
import { suggestItemsForTheme } from "@/lib/ai/sticker-prompts";

// POST /api/ai/stickers/suggest — theme-based item suggestions (editable client-side)
export const POST = withAuth(async (req: NextRequest, _ctx: any, _auth: any) => {
  try {
    const body = await req.json();
    const parsed = StickerSuggestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }
    const theme = parsed.data.theme ?? "daily-life";
    const count = parsed.data.count ?? 6;
    const suggestions = suggestItemsForTheme(theme, count);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Sticker suggest error:", error);
    return NextResponse.json({ error: "Failed to load suggestions" }, { status: 500 });
  }
});