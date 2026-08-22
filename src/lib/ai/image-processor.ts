/**
 * Server-side sticker image processing pipeline (Sharp).
 *
 *   AI output
 *     → validate decode
 *     → ensure RGBA / remove opaque background if needed
 *     → find visible alpha bounds
 *     → trim excessive empty space
 *     → resize preserving aspect ratio (~80-90% canvas occupancy)
 *     → center on a transparent 1024x1024 canvas
 *     → export PNG
 *     → validate final (1024x1024, has alpha)
 *
 * Transparency is REAL (alpha channel). The checkerboard is a UI-preview-only
 * visual — never baked into the file.
 */
import sharp from "sharp";

export const STICKER_CANVAS = 1024;
const ALPHA_THRESHOLD = 12; // a pixel is "visible" if its alpha is above this

export type ProcessOptions = {
  canvasSize?: number;
  transparent: boolean;
  targetScale?: number;
  /**
   * Alpha threshold used when computing the visible subject bounds — pixels
   * below it are treated as transparent so faint background remnants don't
   * expand the cutout. Keep small to preserve legitimate soft edges.
   */
  boundsAlphaThreshold?: number;
};

export type ProcessingErrorKind =
  | "corrupt-image"
  | "processing"
  | "transparency-failed";

export class ProcessingError extends Error {
  constructor(public readonly kind: ProcessingErrorKind, message: string) {
    super(message);
    this.name = "ProcessingError";
  }
}

export type ProcessResult = {
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
};

type Bounds = { left: number; top: number; right: number; bottom: number };
type SizedBuffer = { buffer: Buffer; width: number; height: number };

/**
 * Processes a raw AI image buffer into a clean, centered transparent PNG.
 */
export async function processStickerImage(
  input: Buffer,
  opts: ProcessOptions,
): Promise<ProcessResult> {
  const canvas = opts.canvasSize ?? STICKER_CANVAS;
  const targetScale = opts.targetScale ?? 0.85;

  // 1. Validate it decodes before anything else.
  const meta = await sharp(input).metadata();
  if (!meta?.width || !meta.height) {
    throw new ProcessingError("corrupt-image", "Image did not decode");
  }
  const srcW = meta.width;
  const srcH = meta.height;

  // Working RGBA buffer (always fully opaque at this stage).
  let rgba: Buffer = await sharp(input)
    .removeAlpha()
    .ensureAlpha()
    .raw()
    .toBuffer();

  // 2. If transparency is requested, key out the background. Note: many models
  //    return PNGs whose alpha channel exists but is fully opaque, so we detect
  //    "real" cutouts by scanning for any non-opaque pixel — not just the flag.
  if (opts.transparent && !hasAnyTransparency(rgba)) {
    const keyed = keyOutBackgroundFlood(rgba, srcW, srcH);
    if (keyed) rgba = keyed;
  }

  // 2b. Edge decontamination / de-fringing: pixels bordering transparency that
  //     still carry background color (white halo, green spill, gray matte) get
  //     their color unmixed and alpha feathered, so no fringe ring survives.
  if (opts.transparent) {
    rgba = decontaminateEdges(rgba, srcW, srcH, 2);
  }

  // 3. Find visible-alpha bounds (configurable threshold) and trim.
  const alphaThreshold = opts.boundsAlphaThreshold ?? ALPHA_THRESHOLD;
  const bounds = findAlphaBounds(rgba, srcW, srcH, alphaThreshold);
  if (!bounds) {
    // Per spec: a result with no distinguishable subject is a FAILURE, not a
    // blank sticker.
    throw new ProcessingError(
      "processing",
      "No distinguishable subject found after background removal.",
    );
  }

  const subject = await trimToBounds(rgba, srcW, srcH, bounds);

  // 4. Resize preserving aspect ratio so the subject fills ~targetScale of the
  //    canvas; the remaining margin is intentional TRANSPARENT padding.
  const fitted = await fitSubject(subject, canvas, targetScale);

  // 5. Center the cutout on a transparent canvas (white when opacity off).
  const final = await centerOnCanvas(
    fitted.buffer,
    fitted.width,
    fitted.height,
    canvas,
    !opts.transparent,
  );

  // 6. Validate: alpha channel, clean borders (no rectangular matte), a real
  //    subject, and truly-transparent surroundings. Failure here means the
  //    background removal did not complete — the sticker must NOT be marked
  //    Ready.
  const finalMeta = await sharp(final).metadata();
  if (
    !finalMeta?.width ||
    finalMeta.width !== canvas ||
    finalMeta.height !== canvas ||
    (opts.transparent && !finalMeta.hasAlpha)
  ) {
    throw new ProcessingError("transparency-failed", "Final PNG validation failed");
  }
  if (opts.transparent) {
    validateCutout(final, canvas);
  }

  return { buffer: final, width: canvas, height: canvas, bytes: final.length };
}

/**
 * Renders a small, valid transparent PNG with a centered rounded shape — used by
 * the `mock` AI provider so the full generation→process pipeline is testable in
 * dev without any real provider key.
 */
export async function renderMockSticker(size = 1024): Promise<Buffer> {
  const pad = Math.round(size * 0.15);
  const shapeSize = size - pad * 2;
  const shape = await sharp({
    create: {
      width: shapeSize,
      height: shapeSize,
      channels: 4,
      background: { r: 59, g: 130, b: 246, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${shapeSize}" height="${shapeSize}"><rect width="${shapeSize}" height="${shapeSize}" rx="${Math.round(shapeSize * 0.2)}" fill="#3b82f6"/></svg>`,
        ),
        blend: "over",
      },
    ])
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      // Transparent base (sharp alpha is normalized 0..1).
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: shape, left: pad, top: pad, blend: "over" }])
    .png()
    .toBuffer();
}

/** True if at least one pixel is non-opaque (a real cutout already). */
function hasAnyTransparency(rgba: Buffer): boolean {
  const src = new Uint8Array(rgba);
  for (let i = 3; i < src.length; i += 4) {
    if (src[i] < 250) return true;
  }
  return false;
}

type RGB = [number, number, number];

/** Sample the dominant corner color — the presumed background. */
function getBgColor(rgba: Buffer, width: number, height: number): RGB | null {
  const src = new Uint8Array(rgba);
  if (src.length === 0 || !width || !height) return null;
  const stride = width * 4;
  const corners = [
    0,
    stride - 4,
    (height - 1) * stride,
    (height - 1) * stride + width * 4 - 4,
  ];
  const counts = new Map<string, number>();
  for (const c of corners) {
    if (c < 0 || c + 3 >= src.length) continue;
    const key = `${src[c]},${src[c + 1]},${src[c + 2]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let bestKey: string | null = null;
  let best = 0;
  for (const [key, count] of counts) {
    if (count > best) {
      best = count;
      bestKey = key;
    }
  }
  if (!bestKey) return null;
  const parts = bestKey.split(",").map(Number);
  return [parts[0], parts[1], parts[2]];
}

/**
 * Edge decontamination / de-fringing. For opaque pixels that touch a fully
 * transparent neighbor and still carry background color (white halo, green
 * spill, gray matte), unmix the background contribution:
 *
 *   observed = k·fg + (1−k)·bg   →   fg = (observed − (1−k)·bg) / k
 *
 * where k grows with color distance from the background. This removes white/
 * colored fringe rings while keeping smooth antialiased edges. Runs `passes`
 * times so multi-pixel fringes are eaten layer by layer.
 */
function decontaminateEdges(
  rgba: Buffer,
  width: number,
  height: number,
  passes = 2,
): Buffer {
  const bg = getBgColor(rgba, width, height);
  if (!bg) return rgba;
  const [br, bgG, bb] = bg;

  // Similarity bands: ≤ hardT → fully background; ≥ softT → fully foreground.
  const hardT = 48;
  const softT = 130;

  let out = Buffer.from(new Uint8Array(rgba));
  for (let pass = 0; pass < passes; pass++) {
    const src = new Uint8Array(out);
    const next = Buffer.from(new Uint8Array(out));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        const i = p * 4;
        if (src[i + 3] === 0) continue;

        // Only process pixels that border transparency.
        const touchesTransparent =
          (x > 0 && src[(p - 1) * 4 + 3] === 0) ||
          (x < width - 1 && src[(p + 1) * 4 + 3] === 0) ||
          (y > 0 && src[(p - width) * 4 + 3] === 0) ||
          (y < height - 1 && src[(p + width) * 4 + 3] === 0);
        if (!touchesTransparent) continue;

        const dr = src[i] - br;
        const dg = src[i + 1] - bgG;
        const db = src[i + 2] - bb;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist >= softT) continue; // genuine foreground — leave untouched.

        if (dist <= hardT) {
          // Essentially background sitting on the edge → remove entirely.
          next[i + 3] = 0;
          continue;
        }

        // Partial fringe: estimate foreground coverage and unmix the color.
        const k = Math.max(0.08, (dist - hardT) / (softT - hardT)); // fg ratio
        const fgR = Math.max(0, Math.min(255, (src[i] - (1 - k) * br) / k));
        const fgG = Math.max(0, Math.min(255, (src[i + 1] - (1 - k) * bgG) / k));
        const fgB = Math.max(0, Math.min(255, (src[i + 2] - (1 - k) * bb) / k));
        next[i] = fgR;
        next[i + 1] = fgG;
        next[i + 2] = fgB;
        next[i + 3] = Math.round(255 * k);
      }
    }
    out = next;
  }
  return out;
}

/**
 * Spec-mandated pre-Ready validation of the final cutout:
 * - has an alpha channel with truly-transparent surroundings,
 * - outer boundary frame contains no opaque/semi-opaque background pixels
 *   (catches rectangular white mattes and uncropped full-frame images),
 * - a meaningful subject exists inside.
 * Throws ProcessingError on any failure.
 */
export async function validateCutout(
  final: Buffer,
  canvas: number,
  alphaThreshold = ALPHA_THRESHOLD,
): Promise<void> {
  // Accepts the encoded PNG; decodes to raw RGBA for pixel inspection.
  const decoded = await sharp(final).ensureAlpha().raw().toBuffer();
  const raw = new Uint8Array(decoded);
  if (raw.length !== canvas * canvas * 4) {
    throw new ProcessingError("transparency-failed", "Unexpected pixel buffer size");
  }

  // 1. Outer frame (2px) must be fully transparent — no rectangular matte.
  let borderViolations = 0;
  const frameCheck = (x: number, y: number) => {
    const i = (y * canvas + x) * 4;
    if (raw[i + 3] > alphaThreshold) borderViolations++;
  };
  for (let x = 0; x < canvas; x++) {
    frameCheck(x, 0);
    frameCheck(x, 1);
    frameCheck(x, canvas - 1);
    frameCheck(x, canvas - 2);
  }
  for (let y = 2; y < canvas - 2; y++) {
    frameCheck(0, y);
    frameCheck(1, y);
    frameCheck(canvas - 1, y);
    frameCheck(canvas - 2, y);
  }
  if (borderViolations > 0) {
    throw new ProcessingError(
      "transparency-failed",
      `Cutout validation failed: ${borderViolations} opaque pixel(s) on the canvas border (leftover matte or uncropped background).`,
    );
  }

  // 2. A real subject must exist inside the frame.
  let subjectPixels = 0;
  for (let i = 3; i < raw.length; i += 4) {
    if (raw[i] >= 250) subjectPixels++;
  }
  const minPixels = Math.floor(canvas * canvas * 0.001); // ~0.1%
  if (subjectPixels < minPixels) {
    throw new ProcessingError(
      "processing",
      "No meaningful sticker artwork remains after background removal.",
    );
  }
}

/**
 * Key out the background by flood-filling from the image borders. Only pixels
 * connected to the edge and within `tolerance` of the sampled background color
 * become transparent — interior colors similar to the background are preserved
 * (unlike a naive global color match). Returns a new RGBA buffer.
 */
function keyOutBackgroundFlood(
  rgba: Buffer,
  width: number,
  height: number,
): Buffer | null {
  const src = new Uint8Array(rgba);
  if (src.length === 0 || !width || !height) return null;
  const stride = width * 4;

  const bgColor = getBgColor(rgba, width, height);
  if (!bgColor) return null;
  const [br, bgG, bb] = bgColor;

  const tolerance = 48;
  const nearBg = (i: number): boolean => {
    const dr = src[i] - br;
    const dg = src[i + 1] - bgG;
    const db = src[i + 2] - bb;
    return Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance;
  };

  // Flood fill from every border pixel that matches the background.
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];
  for (let x = 0; x < width; x++) {
    stack.push(x);
    stack.push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    stack.push(y * width);
    stack.push(y * width + width - 1);
  }

  const out = Buffer.from(new Uint8Array(rgba));
  while (stack.length > 0) {
    const p = stack.pop()!;
    if (visited[p]) continue;
    visited[p] = 1;

    const i = p * 4;
    if (!nearBg(i)) continue;
    out[i + 3] = 0; // make transparent

    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  // Defringe: anti-aliased edge pixels adjacent to the keyed region are still
  // blended with the background (white halo). Fade their alpha by how close
  // they are to the background colour and de-matte them, so no fringe shows
  // when the sticker is placed on dark chat backgrounds.
  const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (out[i + 3] === 0) continue;

      let isEdge = false;
      if (x > 0 && out[i - 4 + 3] === 0) isEdge = true;
      else if (x < width - 1 && out[i + 4 + 3] === 0) isEdge = true;
      else if (y > 0 && out[i - stride + 3] === 0) isEdge = true;
      else if (y < height - 1 && out[i + stride + 3] === 0) isEdge = true;
      if (!isEdge) continue;

      const dr = src[i] - br;
      const dg = src[i + 1] - bgG;
      const db = src[i + 2] - bb;
      const d = Math.sqrt(dr * dr + dg * dg + db * db);

      // Fully background-coloured → transparent; blends smoothly outward.
      const a = clampByte((d / (tolerance * 1.25)) * 255);
      out[i + 3] = Math.min(out[i + 3], a);

      if (a > 0 && a < 255) {
        // De-matte: recover subject colour assuming bg was blended over it.
        const af = a / 255;
        out[i] = clampByte((src[i] - (1 - af) * br) / af);
        out[i + 1] = clampByte((src[i + 1] - (1 - af) * bgG) / af);
        out[i + 2] = clampByte((src[i + 2] - (1 - af) * bb) / af);
      }
    }
  }
  return out;
}

/** Bounding box of visible pixels (alpha >= threshold), or null if none. */
function findAlphaBounds(
  rgba: Buffer,
  width: number,
  height: number,
  alphaThreshold = ALPHA_THRESHOLD,
): Bounds | null {
  const src = new Uint8Array(rgba);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (src[row + x * 4 + 3] >= alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0 ? null : { left: minX, top: minY, right: maxX + 1, bottom: maxY + 1 };
}

/** Extract the visible rectangle into its own PNG-sized buffer. */
async function trimToBounds(
  rgba: Buffer,
  width: number,
  height: number,
  bounds: Bounds,
): Promise<SizedBuffer> {
  const w = bounds.right - bounds.left;
  const h = bounds.bottom - bounds.top;
  const buffer = await sharp(rgba, { raw: { width, height, channels: 4 } })
    // NOTE: keep the keyed alpha channel intact — do NOT removeAlpha/ensureAlpha.
    .extract({ left: bounds.left, top: bounds.top, width: w, height: h })
    .png()
    .toBuffer();
  return { buffer, width: w, height: h };
}
/** Resize the subject preserving aspect ratio to fill ~targetScale of canvas. */
async function fitSubject(
  subject: SizedBuffer,
  canvas: number,
  targetScale: number,
): Promise<SizedBuffer> {
  const scale = Math.min(
    (canvas * targetScale) / subject.width,
    (canvas * targetScale) / subject.height,
  );
  const outW = Math.max(1, Math.round(subject.width * scale));
  const outH = Math.max(1, Math.round(subject.height * scale));
  const buffer = await sharp(subject.buffer)
    .resize({ width: outW, height: outH, fit: "fill" })
    // Preserve the keyed alpha — no removeAlpha/ensureAlpha here.
    .png()
    .toBuffer();
  return { buffer, width: outW, height: outH };
}


/** A solid white RGBA rect used as the outline base. */
async function whiteMatte(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

/** Center a subject buffer onto a square canvas and export PNG. */
async function centerOnCanvas(
  subject: Buffer,
  subjectW: number,
  subjectH: number,
  canvas: number,
  opaque = false,
): Promise<Buffer> {
  const base = opaque ? await whiteMatte(canvas, canvas) : await sharpCanvas(canvas);
  return sharp(base)
    .composite([
      {
        input: subject,
        left: Math.round((canvas - subjectW) / 2),
        top: Math.round((canvas - subjectH) / 2),
        blend: "over",
      },
    ])
    .png()
    .toBuffer();
}

/** A fully transparent RGBA canvas buffer. */
async function sharpCanvas(size: number): Promise<Buffer> {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      // sharp normalizes create-background alpha to 0..1 — 1 means OPAQUE.
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
}