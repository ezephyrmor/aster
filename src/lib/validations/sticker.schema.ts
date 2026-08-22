import { z } from "zod";
import { STICKER_THEMES, STICKER_STYLES } from "@/lib/ai/sticker-prompts";

/** Server-side provider allowlist (kept local so validations stay client-safe). */
const PROVIDER_NAMES = [
  "openai",
  "stability",
  "google",
  "openrouter",
  "huggingface",
  "mock",
];
const providerKeys = PROVIDER_NAMES as [string, ...string[]];

/** Limits enforced server-side for the sticker generator (spec: reasonable limits). */
export const STICKER_LIMITS = {
  packName: 100,
  prompt: 500,
  itemName: 100,
  itemInstructions: 400,
  negative: 300,
  batchInstructions: 800,
  maxStickers: 24,
  imageSize: 1024,
} as const;

/** Output canvas sizes offered in the UI (server-validated). */
export const STICKER_SIZES = [256, 512, 768, 1024, 1536, 2048] as const;
const sizeValues = STICKER_SIZES.map((s) => s);

/** White outline strengths (post-processing die-cut border width). */
export const STICKER_OUTLINE_STRENGTHS = [
  "none",
  "subtle",
  "medium",
  "thick",
] as const;
const outlineKeys = STICKER_OUTLINE_STRENGTHS as [string, ...string[]];

const themeKeys = Object.keys(STICKER_THEMES) as [string, ...string[]];
const styleKeys = Object.keys(STICKER_STYLES) as [string, ...string[]];

export const StickerPackSchema = z.object({
  name: z.string().trim().min(1).max(STICKER_LIMITS.packName),
  theme: z.enum(themeKeys),
  style: z.enum(styleKeys),
  provider: z.enum(providerKeys).optional(),
  count: z.number().int().min(1).max(STICKER_LIMITS.maxStickers).default(6),
  size: z
    .number()
    .int()
    .refine((v) => (sizeValues as number[]).includes(v), {
      message: `Size must be one of ${sizeValues.join(", ")}`,
    })
    .default(STICKER_LIMITS.imageSize),
  transparent: z.boolean().default(true),
  outline: z.boolean().default(true),
  outlineStrength: z.enum(outlineKeys).default("medium"),
  batchInstructions: z.string().trim().max(STICKER_LIMITS.batchInstructions).optional(),
  negativePrompt: z.string().trim().max(STICKER_LIMITS.negative).optional(),
});

export const StickerItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(STICKER_LIMITS.itemName),
  instructions: z.string().trim().max(STICKER_LIMITS.itemInstructions).optional(),
  negativeInstructions: z.string().trim().max(STICKER_LIMITS.negative).optional(),
});

export const StickerItemsSchema = z.object({
  items: z.array(StickerItemSchema).min(1).max(STICKER_LIMITS.maxStickers),
});

export const StickerGenerateSchema = z.object({
  packId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const StickerSuggestSchema = z.object({
  theme: z.enum(themeKeys).optional(),
  count: z.number().int().min(1).max(20).optional(),
});

export type StickerPackData = z.infer<typeof StickerPackSchema>;
export type StickerItemData = z.infer<typeof StickerItemSchema>;