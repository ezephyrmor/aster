import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { isProviderConfigured, STICKER_PROVIDERS } from "@/lib/ai/provider";
import { defaultModelFor, PROVIDER_MODELS } from "@/lib/ai/models";

// GET /api/ai/stickers/providers — which providers the UI may select, whether
// each has its API key configured server-side, and each provider's model
// catalog categorized by freeness (free / free-tier / paid) for the picker.
export const GET = withAuth(async () => {
  return NextResponse.json({
    providers: STICKER_PROVIDERS.map((id) => ({
      id,
      configured: isProviderConfigured(id),
      models: PROVIDER_MODELS[id],
      defaultModel: defaultModelFor(id),
    })),
    defaultProvider: process.env.AI_PROVIDER || "mock",
  });
});