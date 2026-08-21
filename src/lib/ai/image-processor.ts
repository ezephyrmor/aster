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
  outline?: boolean;
  targetScale?: number;
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

  // 2. If transparency is requested but the source has no alpha, key out the
  //    dominant (edge) background color so the subject gets real transparency.
  const hasRealAlpha = Boolean(meta.hasAlpha);
  if (opts.transparent && !hasRealAlpha) {
    const keyed = keyOutBackground(rgba, srcW, srcH);
    if (keyed) rgba = keyed;
  }

  // 3. Find visible-alpha bounds and trim excessive empty space.
  const bounds = findAlphaBounds(rgba, srcW, srcH);
  if (!bounds) {
    const blank = await sharpCanvas(canvas);
    return { buffer: blank, width: canvas, height: canvas, bytes: blank.length };
  }

  const subject = await trimToBounds(rgba, srcW, srcH, bounds);

  // 4. Resize preserving aspect ratio so the subject fills ~targetScale.
  const fitted = await fitSubject(subject, canvas, targetScale);

  // 5. Optional white outline matte (grows the subject slightly).
  let toCenter: Buffer;
  let centerW: number;
  let centerH: number;
  if (opts.outline && opts.transparent) {
    const outlined = await applyOutline(fitted.buffer, fitted.width, fitted.height);
    toCenter = outlined.buffer;
    centerW = outlined.width;
    centerH = outlined.height;
  } else {
    toCenter = fitted.buffer;
    centerW = fitted.width;
    centerH = fitted.height;
  }

  // 6. Center on a canvas (transparent by default, white when opacity turned off).
  const final = await centerOnCanvas(toCenter, centerW, centerH, canvas, !opts.transparent);

  // 7. Validate the final file.
  const finalMeta = await sharp(final).metadata();
  if (
    !finalMeta?.width ||
    finalMeta.width !== canvas ||
    finalMeta.height !== canvas ||
    (opts.transparent && !finalMeta.hasAlpha)
  ) {
    throw new ProcessingError("transparency-failed", "Final PNG validation failed");
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
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: shape, left: pad, top: pad, blend: "over" }])
    .png()
    .toBuffer();
}

/**
 * Key out the dominant edge color in an opaque RGBA buffer so the subject gets
 * real transparency. Returns a new RGBA buffer, or null if it cannot decide.
 */
function keyOutBackground(rgba: Buffer, width: number, height: number): Buffer | null {
  const src = new Uint8Array(rgba);
  if (src.length === 0 || !width || !height) return null;

  // Sample the four corners to find a background color.
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
  if (counts.size === 0) return null;

  let bg: [number, number, number] | null = null;
  let best = 0;
  for (const [rgb, count] of counts) {
    if (count > best) {
      best = count;
      const parts = rgb.split(",").map(Number);
      bg = [parts[0], parts[1], parts[2]];
    }
  }
  if (!bg) return null;
  const [br, bgG, bb] = bg;

  const out = Buffer.from(new Uint8Array(rgba.length));
  const threshold = 60;
  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    const dr = r - br;
    const dg = g - bgG;
    const db = b - bb;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = dist > threshold ? 255 : 0;
  }
  return out;
}

/** Bounding box of visible pixels (alpha >= threshold), or null if none. */
function findAlphaBounds(
  rgba: Buffer,
  width: number,
  height: number,
): Bounds | null {
  const src = new Uint8Array(rgba);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (src[row + x * 4 + 3] >= ALPHA_THRESHOLD) {
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
    .extract({ left: bounds.left, top: bounds.top, width: w, height: h })
    .removeAlpha()
    .ensureAlpha()
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
    .removeAlpha()
    .ensureAlpha()
    .png()
    .toBuffer();
  return { buffer, width: outW, height: outH };
}

/**
 * thin white outline fully contained within its own (transparent) bounds.
 */
async function applyOutline(
  buffer: Buffer,
  width: number,
  height: number,
): Promise<SizedBuffer> {
  const outW = Math.round(width * 1.06);
  const outH = Math.round(height * 1.06);

  const matte = await whiteMatte(outW, outH);
  const composited = await sharp(matte)
    .composite([
      {
        input: buffer,
        left: Math.round((outW - width) / 2),
        top: Math.round((outH - height) / 2),
        blend: "over",
      },
    ])
    .png()
    .toBuffer();

  return { buffer: composited, width: outW, height: outH };
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
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .png()
    .toBuffer();
}