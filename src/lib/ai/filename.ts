/**
 * Filename sanitization helpers for sticker exports.
 *
 * Server-side safety: filenames are ALWAYS derived from a known item name on
 * the server, never trusted from the client. See the sticker generator spec.
 */

/** Slugify a display name into a safe filename base, e.g. "Coffee Mug" → "coffee-mug". */
export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || "sticker";
}

/** Build a safe, extension-safe filename, e.g. "Coffee Mug" → "coffee-mug.png". */
export function stickerFilename(name: string, ext: "png" | "json" = "png"): string {
  const slug = slugifyName(name);
  return `${slug}.${ext}`;
}

/** Ensure a set of names yields unique filenames by appending -1, -2, ... */
export function dedupeFilenames(items: Array<{ id: string; filename: string }>): Map<string, string> {
  const seen = new Map<string, number>();
  const result = new Map<string, string>();
  for (const item of items) {
    const count = seen.get(item.filename) ?? 0;
    seen.set(item.filename, count + 1);
    const filename = count === 0 ? item.filename : item.filename.replace(/\.(\w+)$/, `-${count + 1}.$1`);
    result.set(item.id, filename);
  }
  return result;
}