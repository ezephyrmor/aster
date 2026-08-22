/**
 * Sticker prompt presets — the single source of truth for sticker generation
 * prompts and the negative-prompt system.
 *
 * Everything here is centralized (per the spec): components, API routes, and
 * providers read from this module, never duplicate prompt text.
 */

/** Hard positive rules every sticker generation follows. */
export const BASE_STICKER_PROMPT = `
A single simple sticker icon. Exactly one isolated primary subject in the center.
Simple sticker design with clean silhouette and clean edges. Comfortable padding
around the subject, nothing touching the canvas edges, no cropping.
No text, letters, words, numbers, captions, labels, logo, watermark, or signature.
No scenery, background detail, or unnecessary environment. Transparent background.
`.trim();

/**
 * Base Negative Prompt — the canonical negative-prompt string applied to EVERY
 * sticker generation (from the spec). Do not duplicate this text elsewhere.
 */
export const BASE_NEGATIVE_PROMPT = `
multiple stickers, multiple subjects, duplicate objects, repeated objects, extra objects,
unrelated objects, clutter, busy composition, scenery, environment, detailed background,
text, letters, words, numbers, captions, labels, logo, watermark, signature, hands, fingers,
people unless explicitly requested, cropped subject, cut off object, object touching canvas
edge, distorted proportions, malformed shapes, warped object, broken geometry, merged objects,
floating parts, disconnected parts, blurry, pixelated, low quality, artifacts, messy edges,
jagged edges, rough cutout, white background, colored background, gradient background,
checkerboard background, fake transparency, excessive shadows, sticker sheet, collage, grid,
contact sheet
`.replace(/\s+/g, " ").trim();

/** Themes (shown in the UI). Extend centrally. */
export const THEMES: Record<string, string> = {
  "daily-life": "everyday life, casual daily scenes",
  study: "studying, school supplies, learning",
  work: "professional work, office",
  productivity: "productivity, getting things done",
  food: "food and drinks",
  coffee: "coffee and cafe",
  love: "love, hearts, romance",
  travel: "travel, adventure",
  weather: "weather, seasons, sky",
  fitness: "fitness, exercise, health",
  "self-care": "self care, wellness",
  gaming: "gaming, video games",
  pets: "pets, animals",
  plants: "plants, nature",
  mood: "moods, emotions",
  sleep: "sleep, rest, dreams",
  shopping: "shopping, retail",
  chores: "household chores, cleaning",
};

/**
 * Style maps. Each style may specify a positive suffix AND optional style-specific
 * negative terms (only added when they make sense for that style).
 */
export const STYLE_PROMPTS: Record<string, string> = {
  kawaii: "cute kawaii sticker style, adorable, rounded, pastel-friendly",
  "cozy-kawaii": "cozy kawaii, soft rounded shapes, warm and comfortable, cute",
  "soft-pastel": "soft pastel color palette, gentle, dreamy",
  "hand-drawn": "hand-drawn sticker, sketchy ink outlines, charming imperfections",
  doodle: "doodle style, playful single-color outlines",
  flat: "flat vector illustration, bold clean shapes, solid colors",
  minimal: "minimalist flat design, simple shapes, lots of empty space",
  "cute-3d": "cute 3D render, glossy, soft plastic, subtle depth",
  watercolor: "watercolor wash, soft organic edges, translucent color",
  "pixel-art": "pixel art, crisp pixels, retro game style",
};

/** Optional style-specific negatives — only added when they make sense. */
export const STYLE_NEGATIVES: Record<string, string> = {
  "cute-3d":
    "realistic photograph, realistic environment, product photography, studio backdrop, harsh shadows",
  "pixel-art": "photorealism, painterly brushwork, watercolor, smooth vector illustration",
  "soft-pastel": "neon colors, harsh contrast, dark background",
  doodle: "gradients, shading, heavy 3D depth",
  "hand-drawn": "perfectly straight lines, vector-smooth edges",
  flat: "texture, noise, photorealism, gradient",
};

export type StickerPromptInput = {
  theme: string;
  style: string;
  itemName: string;
  outline?: boolean;
  batchInstructions?: string | null;
  itemInstructions?: string | null;
  batchNegative?: string | null;
  itemNegative?: string | null;
  userNegative?: string | null;
};

export type BuiltStickerPrompt = {
  positive: string;
  negative: string;
};

/** Joins non-empty prompt segments with a clean separator. */
function joinSegments(segments: Array<string | null | undefined>): string {
  return segments
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(", ");
}
/**
 * Build the final negative prompt:
 *   BASE_NEGATIVE_PROMPT + STYLE_NEGATIVE + BATCH_NEGATIVE + ITEM_NEGATIVE + USER_ADDITIONAL
 * Empty segments are dropped and overlapping terms de-duplicated term-by-term.
 */
export function buildNegativePrompt(
  styleSpecific?: string | null,
  batchNegative?: string | null,
  itemNegative?: string | null,
  userNegative?: string | null,
): string {
  const segments: Array<string | null | undefined> = [
    BASE_NEGATIVE_PROMPT,
    styleSpecific,
    batchNegative,
    itemNegative,
    userNegative,
  ].filter(Boolean);

  const seen = new Set<string>();
  const terms: string[] = [];
  for (const segment of segments) {
    for (const raw of (segment ?? "").split(",")) {
      const term = raw.trim();
      if (!term) continue;
      const key = term.toLowerCase();
      if (seen.has(key)) continue; // dedupe overlapping negatives
      seen.add(key);
      terms.push(term);
    }
  }
  return terms.join(", ");
}

/**
 * Build the final positive sticker prompt + negative prompt together:
 *   positive = BASE_STICKER_PROMPT + STYLE_PROMPT + THEME + ITEM + BATCH_INSTRUCTIONS + ITEM_INSTRUCTIONS
 *   negative = buildNegativePrompt(styleNegative, batchNegative, itemNegative, userNegative)
 */
export function buildStickerPrompt(input: StickerPromptInput): BuiltStickerPrompt {
  const stylePrompt = STYLE_PROMPTS[input.style] ?? "";
  const themePrompt = THEMES[input.theme] ?? "";
  const styleNegative = STYLE_NEGATIVES[input.style] ?? "";

  const positive = joinSegments([
    BASE_STICKER_PROMPT,
    stylePrompt,
    themePrompt,
    `a sticker of ${input.itemName}`,
    input.outline
      ? "die-cut sticker with a clean solid white border around the silhouette"
      : null,
    input.batchInstructions,
    input.itemInstructions,
  ]);

  const negative = buildNegativePrompt(
    styleNegative,
    input.batchNegative,
    input.itemNegative,
    input.userNegative,
  );

  return { positive, negative };
}

// Convenience alias for parity with other validations in the codebase.
export { buildNegativePrompt as buildStickerNegativePrompt };

// Re-export the maps so the UI, routes, and providers import from one module.
/**
 * Theme-based item suggestion catalog (spec: "Suggest Items" action).
 * Items remain editable before generation. Extend centrally.
 */
export const SUGGEST_BY_THEME: Record<string, string[]> = {
  "daily-life": ["coffee mug", "open diary", "pencil", "candle", "books", "toothbrush"],
  study: ["pencil", "notebook", "glasses", "backpack", "diploma", "calculator"],
  work: ["laptop", "briefcase", "coffee cup", "clipboard", "paperclip", "keyboard"],
  productivity: ["checklist", "alarm clock", "laptop", "calendar", "lightbulb", "progress bar"],
  food: ["burger", "pizza slice", "apple", "taco", "croissant", "ice cream cone"],
  coffee: ["coffee cup", "latte", "espresso", "coffee beans", "teacup", "french press"],
  love: ["heart", "love letter", "rose", "couple", "ring", "kiss"],
  travel: ["suitcase", "airplane", "palm tree", "map", "passport", "camera"],
  weather: ["sun", "rain cloud", "snowflake", "rainbow", "storm cloud", "wind"],
  fitness: ["dumbbell", "water bottle", "running shoe", "heartbeat", "kettlebell", "jump rope"],
  "self-care": ["bath bomb", "face mask", "candle", "yoga pose", "tea cup", "plant"],
  gaming: ["game controller", "joystick", "gameboy", "dice", "retro tv", "power button"],
  pets: ["cat", "dog", "bird", "goldfish", "hamster", "bone"],
  plants: ["potted plant", "succulent", "monstera leaf", "cactus", "sunflower", "plant sprout"],
  mood: ["happy face", "star", "cloud", "thunder bolt", "sleepy face", "sparkle"],
  sleep: ["moon", "pillow", "bed", "pajamas", "zzz", "dream cloud"],
  shopping: ["shopping bag", "price tag", "shopping cart", "gift box", "receipt", "sunglasses"],
  chores: ["broom", "sponge", "laundry basket", "bucket", "dish soap", "vacuum"],
};

/** Returns a themed suggestion list (default count). */
export function suggestItemsForTheme(theme: string, count = 6): string[] {
  const list = SUGGEST_BY_THEME[theme] ?? SUGGEST_BY_THEME["daily-life"];
  return list.slice(0, Math.max(1, count));
}

// Re-export the maps and theme/style helpers from one module.
export { THEMES as STICKER_THEMES, STYLE_PROMPTS as STICKER_STYLES };