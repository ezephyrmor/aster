-- Add per-pack model selection (catalog id from src/lib/ai/models.ts).
ALTER TABLE "sticker_packs" ADD COLUMN "model" VARCHAR(120);
