// Client-safe theme/style option lists for the sticker generator UI.
// Prompt TEXT stays centralized server-side in src/lib/ai/sticker-prompts.ts;
// this file only powers dropdown labels so client components never import
// server-only modules.

export const STICKER_THEMES: Record<string, string> = {
  "daily-life": "Daily Life",
  study: "Study",
  work: "Work",
  productivity: "Productivity",
  food: "Food",
  coffee: "Coffee",
  love: "Love",
  travel: "Travel",
  weather: "Weather",
  fitness: "Fitness",
  "self-care": "Self Care",
  gaming: "Gaming",
  pets: "Pets",
  plants: "Plants",
  mood: "Mood",
  sleep: "Sleep",
  shopping: "Shopping",
  chores: "Chores",
  music: "Music",
  sports: "Sports",
  space: "Space",
  ocean: "Ocean",
  vehicles: "Vehicles",
  celebration: "Celebration",
  tech: "Tech",
  holiday: "Holiday",
};

export const STICKER_DISPLAY_STYLES: Record<string, string> = {
  kawaii: "Kawaii",
  "cozy-kawaii": "Cozy Kawaii",
  "soft-pastel": "Soft Pastel",
  "hand-drawn": "Hand Drawn",
  doodle: "Doodle",
  flat: "Flat",
  minimal: "Minimal",
  "cute-3d": "Cute 3D",
  watercolor: "Watercolor",
  "pixel-art": "Pixel Art",
  neon: "Neon Glow",
  claymation: "Claymation",
  papercut: "Paper Cut",
  "line-art": "Line Art",
  "retro-vintage": "Retro Vintage",
  emoji: "Emoji",
};

export const THEME_KEYS = Object.keys(STICKER_THEMES);
export const STYLE_KEYS = Object.keys(STICKER_DISPLAY_STYLES);