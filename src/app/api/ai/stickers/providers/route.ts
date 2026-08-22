import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { isProviderConfigured, STICKER_PROVIDERS } from "@/lib/ai/provider";

// GET /api/ai/stickers/providers — which providers the UI may select, and
// whether each has its API key configured server-side. Switching providers is
// a per-pack UI decision; .env only supplies keys (and an optional default).
export const GET = withAuth(async () => {
  return NextResponse.json({
    providers: STICKER_PROVIDERS.map((id) => ({
      id,
      configured: isProviderConfigured(id),
    })),
    defaultProvider: process.env.AI_PROVIDER || "mock",
  });
});