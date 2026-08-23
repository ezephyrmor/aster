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
// A pixel is "visible" if its alpha is above this. Spec: α < 8 → transparent.
const ALPHA_THRESHOLD = 8;

// --- Cutout cleanup parameters (see sticker-cleanup spec) ---
// Near-white residue: RGB all ≥ this → background remnant on edges.
const NEAR_WHITE_THRESHOLD = 245;
// Near-gray residue: channels ≥ this with very low saturation.
const NEAR_GRAY_THRESHOLD = 230;
const NEAR_GRAY_MAX_SATURATION = 24;
// How many pixels deep (from transparency) an outline residue can sit.
const OUTLINE_DEPTH = 3;
// A residue-colored connected region extending deeper than this from the
// cutout edge is genuine white/gray ARTWORK (highlights, thick shapes) —
// never remove it. Thin halos/outlines never reach this depth.
const ARTWORK_MIN_DEPTH = 6;
// --- Subject-component keep (replaces the old fixed 16px despeckle cap) ---
// A secondary connected component is only kept as genuine art when it is at
// least this many pixels AND at least this fraction of the main subject AND
// over this fraction of its pixels are fully opaque. Ghost outlines,
// fragments, disconnected blobs and speckles — no matter how large — never
// satisfy all three, so they are removed in full. The subject (largest
// component) is always kept.
const KEEP_ART_MIN_SIZE = 4;
const KEEP_ART_FRACTION = 0.1;
const KEEP_ART_OPAQUE = 0.95;
// A visible pixel directly bordering transparency with alpha at/below this is
// semi-transparent fringe (faint halo of any inherited colour). It is erased
// so no low-opacity rim survives outside the true subject edge.
const RESIDUAL_FRINGE_MAX_ALPHA = 96;

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
  /**
   * Use nearest-neighbor scaling (crisp square pixels) — intended for the
   * pixel-art style so downscaling doesn't blur the pixel grid.
   */
  pixelated?: boolean;
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

  // Working RGBA buffer. Keep the source alpha intact — some models already
  // return a real (partially transparent) cutout, and flattening it here would
  // let detached semi-transparent fragments survive the cleanup below.
  let rgba: Buffer = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer();

  // 2. If transparency is requested, key out the background. Note: many models
  //    return PNGs whose alpha channel exists but is fully opaque, so we detect
  //    "real" cutouts by scanning for any non-opaque pixel — not just the flag.
  if (opts.transparent && !hasAnyTransparency(rgba)) {
    const keyed = keyOutBackgroundWithEscalation(rgba, srcW, srcH);
    if (keyed) rgba = keyed;
  }

  // 2b. Residual outline removal FIRST: absolute near-white / near-gray halo
  //     pixels near transparency are zeroed, while deep residue-colored
  //     regions (genuine artwork) are detected and protected.
  if (opts.transparent) {
    const { out: deOutlined, protectedPx } = removeResidualOutlines(rgba, srcW, srcH);
    // 2c. Edge decontamination / de-fringing: pixels bordering transparency
    //     that still carry background color get unmixed and alpha feathered,
    //     skipping protected genuine-artwork pixels.
    rgba = decontaminateEdges(deOutlined, srcW, srcH, 2, protectedPx);
    // 2d. Alpha refinement: anything below the visibility floor is truly
    //     transparent; no semi-transparent haze may remain.
    refineAlpha(rgba, ALPHA_THRESHOLD);
    // 2e. Subject-component keep: every connected region that is not the
    //     subject (or solid, large genuine art) is removed — ghost outlines,
    //     fragments, stray dots, colored blobs and shadows of ANY size.
    rgba = keepSubjectComponents(rgba, srcW, srcH);
    // 2f. Residual-fringe erasure: semi-transparent halo/haze pixels hugging
    //     the true boundary are deleted so no faint rim of any colour remains
    //     outside the anti-aliased subject edge.
    rgba = eraseResidualFringe(rgba, srcW, srcH);
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
  const fitted = await fitSubject(
    subject,
    canvas,
    targetScale,
    opts.pixelated ? "nearest" : "lanczos3",
  );

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
  protectedPx?: Uint8Array,
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
        // Never de-fringe genuine artwork pixels.
        if (protectedPx && protectedPx[p]) continue;
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

  // 3. Halo / stray-pixel audit: visible residue-colored pixels (near-white or
  //    near-gray) sitting directly on the transparency boundary indicate an
  //    outline remnant the cleanup stages failed to remove. Pixels belonging
  //    to protected deep artwork regions are exempt.
  const stride = canvas * 4;
  const { protectedPx } = analyzeResidue(raw as unknown as Buffer, canvas, canvas);
  let haloViolations = 0;
  for (let y = 2; y < canvas - 2; y++) {
    for (let x = 2; x < canvas - 2; x++) {
      const p = y * canvas + x;
      const i = p * 4;
      if (raw[i + 3] <= alphaThreshold) continue;
      const touchesTransparent =
        raw[i - 4 + 3] <= alphaThreshold ||
        raw[i + 4 + 3] <= alphaThreshold ||
        raw[i - stride + 3] <= alphaThreshold ||
        raw[i + stride + 3] <= alphaThreshold;
      if (!touchesTransparent) continue;
      if (protectedPx[p]) continue;
      if (isResidueColor(raw[i], raw[i + 1], raw[i + 2])) haloViolations++;
    }
  }
  // ~64px on a 1024 canvas: well below a visible ring, above pixel noise.
  const haloTolerance = Math.max(16, Math.floor(canvas * canvas * 0.00006));
  if (haloViolations > haloTolerance) {
    throw new ProcessingError(
      "transparency-failed",
      `Cutout validation failed: ${haloViolations} residual outline/halo pixels around the subject.`,
    );
  }
}

/**
 * Key out the background, escalating tolerance when the first pass barely
 * removes anything. Models that ignore the "plain solid backdrop" instruction
 * and paint scenery (leaves, corals, gradients) produce backgrounds far from
 * the sampled border color — a fixed tolerance would fail silently and the
 * whole opaque image (background included) would ship as the sticker.
 *
 * Strategy: try progressively higher tolerances; accept the first pass that
 * keys a meaningful share of the image (>4% of pixels). If none reaches that,
 * fall back to the pass that removed the most — better an aggressive cutout
 * than shipping a full background scene.
 */
function keyOutBackgroundWithEscalation(
  rgba: Buffer,
  width: number,
  height: number,
): Buffer | null {
  const total = width * height;
  const tolerances = [48, 72, 100, 132];
  let best: Buffer | null = null;
  let bestRemoved = 0;

  for (const tolerance of tolerances) {
    const keyed = keyOutBackgroundFlood(rgba, width, height, tolerance);
    if (!keyed) return best;
    let removed = 0;
    for (let p = 0; p < total; p++) {
      if (keyed[p * 4 + 3] === 0) removed++;
    }
    const fraction = removed / total;
    if (fraction > bestRemoved) {
      bestRemoved = fraction;
      best = keyed;
    }
    if (fraction >= 0.04) return keyed;
  }
  return best;
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
  tolerance = 48,
): Buffer | null {
  const src = new Uint8Array(rgba);
  if (src.length === 0 || !width || !height) return null;
  const stride = width * 4;

  const bgColor = getBgColor(rgba, width, height);
  if (!bgColor) return null;
  const [br, bgG, bb] = bgColor;

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

/**
 * True if the color is near-white residue (RGB ≥ NEAR_WHITE_THRESHOLD) or
 * near-gray low-saturation residue (channels ≥ NEAR_GRAY_THRESHOLD with
 * max-min spread ≤ NEAR_GRAY_MAX_SATURATION).
 */
function isResidueColor(r: number, g: number, b: number): boolean {
  if (r >= NEAR_WHITE_THRESHOLD && g >= NEAR_WHITE_THRESHOLD && b >= NEAR_WHITE_THRESHOLD) {
    return true;
  }
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  return min >= NEAR_GRAY_THRESHOLD && max - min <= NEAR_GRAY_MAX_SATURATION;
}

/**
 * Shared geometry for residue handling:
 * - `depth`: BFS distance (px) of every pixel from the transparent region
 *   (0 = transparent, -1 unreachable/full frame).
 * - `protectedPx`: residue-colored connected regions whose maximum depth
 *   exceeds ARTWORK_MIN_DEPTH — i.e. genuine white/gray artwork, not outlines.
 */
function analyzeResidue(
  rgba: Buffer,
  width: number,
  height: number,
): { depth: Int16Array; protectedPx: Uint8Array } {
  const src = new Uint8Array(rgba);
  const n = width * height;

  const depth = new Int16Array(n).fill(-1);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (let p = 0; p < n; p++) {
    if (src[p * 4 + 3] === 0) {
      depth[p] = 0;
      queue[tail++] = p;
    }
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const neighbors = [
      x > 0 ? p - 1 : -1,
      x < width - 1 ? p + 1 : -1,
      p - width,
      p + width,
    ];
    for (const q of neighbors) {
      if (q < 0 || q >= n || depth[q] !== -1) continue;
      depth[q] = depth[p] + 1;
      queue[tail++] = q;
    }
  }

  const protectedPx = new Uint8Array(n);
  const visited = new Uint8Array(n);
  const region = new Int32Array(n);
  for (let start = 0; start < n; start++) {
    if (visited[start] || depth[start] <= 0) continue;
    const i = start * 4;
    if (!isResidueColor(src[i], src[i + 1], src[i + 2])) continue;

    // Collect this connected residue-colored region via BFS.
    let rTail = 0;
    let maxDepth = 0;
    region[rTail++] = start;
    visited[start] = 1;
    let h = 0;
    while (h < rTail) {
      const p = region[h++];
      const x = p % width;
      maxDepth = Math.max(maxDepth, depth[p]);
      const push = (q: number) => {
        if (q < 0 || q >= n || visited[q] || depth[q] <= 0) return;
        const j = q * 4;
        if (!isResidueColor(src[j], src[j + 1], src[j + 2])) return;
        visited[q] = 1;
        region[rTail++] = q;
      };
      push(x > 0 ? p - 1 : -1);
      push(x < width - 1 ? p + 1 : -1);
      push(p - width);
      push(p + width);
    }
    // Deep residue-colored regions are genuine artwork, not outlines.
    if (maxDepth > ARTWORK_MIN_DEPTH) {
      for (let k = 0; k < rTail; k++) protectedPx[region[k]] = 1;
    }
  }

  return { depth, protectedPx };
}

/**
 * Residual outline / halo removal (spec step: "Remove Residual Outlines").
 *
 * Visible pixels within OUTLINE_DEPTH of transparency whose color is
 * near-white/near-gray are zeroed — except pixels belonging to protected
 * deep residue regions (genuine artwork).
 */
function removeResidualOutlines(
  rgba: Buffer,
  width: number,
  height: number,
): { out: Buffer; protectedPx: Uint8Array } {
  const { depth, protectedPx } = analyzeResidue(rgba, width, height);
  const n = width * height;

  const out = Buffer.from(new Uint8Array(rgba));
  for (let p = 0; p < n; p++) {
    if (depth[p] <= 0 || depth[p] > OUTLINE_DEPTH || protectedPx[p]) continue;
    const i = p * 4;
    if (isResidueColor(out[i], out[i + 1], out[i + 2])) {
      out[i + 3] = 0;
    }
  }
  return { out, protectedPx };
}

/** Alpha refinement: any pixel below the visibility floor becomes α = 0. */
function refineAlpha(rgba: Buffer, floor: number): void {
  const out = new Uint8Array(rgba);
  for (let i = 3; i < out.length; i += 4) {
    if (out[i] > 0 && out[i] < floor) out[i] = 0;
  }
}

/**
 * Keep only the subject (and any genuinely separate solid/large artwork).
 *
 * Labels every connected visible component and removes all components that are
 * not clearly the subject: the largest component is always kept; any other is
 * kept only if it is a solid (≥ KEEP_ART_OPAQUE opaque) region that is both ≥
 * KEEP_ART_MIN_SIZE pixels and ≥ KEEP_ART_FRACTION of the largest. Ghost
 * outlines, stray blobs, speckles, disconnected fragments and shadows — of any
 * size — never satisfy all three, so they are removed in full. Nothing outside
 * the true subject boundary survives to the final PNG.
 */
export function keepSubjectComponents(
  rgba: Buffer,
  width: number,
  height: number,
): Buffer {
  const src = new Uint8Array(rgba);
  const n = width * height;
  const label = new Int32Array(n).fill(-1); // -1 = unvisited, -2 = background
  const compSize: number[] = [];
  const compOpaque: number[] = [];

  for (let start = 0; start < n; start++) {
    if (label[start] !== -1) continue;
    if (src[start * 4 + 3] < ALPHA_THRESHOLD) {
      label[start] = -2;
      continue;
    }
    const id = compSize.length;
    label[start] = id;
    compSize.push(0);
    compOpaque.push(0);
    const stack: number[] = [start];
    while (stack.length) {
      const p = stack.pop()!;
      compSize[id]++;
      if (src[p * 4 + 3] >= 250) compOpaque[id]++;
      const x = p % width;
      const visit = (q: number) => {
        if (q < 0 || q >= n || label[q] !== -1) return;
        if (src[q * 4 + 3] < ALPHA_THRESHOLD) {
          label[q] = -2;
          return;
        }
        label[q] = id;
        stack.push(q);
      };
      visit(x > 0 ? p - 1 : -1);
      visit(x < width - 1 ? p + 1 : -1);
      visit(p - width);
      visit(p + width);
    }
  }

  let largest = 0;
  for (const size of compSize) largest = Math.max(largest, size);

  const keep = new Uint8Array(compSize.length);
  for (let id = 0; id < compSize.length; id++) {
    const size = compSize[id];
    const isLargest = size === largest;
    const opaqueFrac = compOpaque[id] / Math.max(1, size);
    const solidLargeArt =
      size >= KEEP_ART_MIN_SIZE &&
      size >= KEEP_ART_FRACTION * largest &&
      opaqueFrac >= KEEP_ART_OPAQUE;
    if (isLargest || solidLargeArt) keep[id] = 1;
  }

  const out = Buffer.from(new Uint8Array(rgba));
  for (let p = 0; p < n; p++) {
    const id = label[p];
    if (id >= 0 && !keep[id]) out[p * 4 + 3] = 0;
  }
  return out;
}

/**
 * Residual-fringe erasure (spec step: "Contract the mask ~1px inward").
 *
 * A visible pixel that borders fully-transparent neighbors but carries low
 * alpha is semi-transparent fringe — a faint halo of whatever background color
 * was originally behind the subject. Deleting it removes the haze and pulls
 * the visible edge inward by ~1px, leaving only the harder true outline and
 * any stronger anti-aliasing directly on the subject boundary. Background
 * pixels outside that boundary end up fully transparent (alpha = 0).
 */
export function eraseResidualFringe(
  rgba: Buffer,
  width: number,
  height: number,
): Buffer {
  const src = new Uint8Array(rgba);
  const out = Buffer.from(new Uint8Array(rgba));
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const p = row + x;
      const i = p * 4;
      if (src[i + 3] === 0 || src[i + 3] >= 255) continue;
      if (src[i + 3] > RESIDUAL_FRINGE_MAX_ALPHA) continue;
      const touchesTransparent =
        (x > 0 && src[i - 4 + 3] === 0) ||
        (x < width - 1 && src[i + 4 + 3] === 0) ||
        (y > 0 && src[i - width * 4 + 3] === 0) ||
        (y < height - 1 && src[i + width * 4 + 3] === 0);
      if (touchesTransparent) out[i + 3] = 0;
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
  kernel: "nearest" | "lanczos3" = "lanczos3",
): Promise<SizedBuffer> {
  const scale = Math.min(
    (canvas * targetScale) / subject.width,
    (canvas * targetScale) / subject.height,
  );
  const outW = Math.max(1, Math.round(subject.width * scale));
  const outH = Math.max(1, Math.round(subject.height * scale));
  const buffer = await sharp(subject.buffer)
    .resize({ width: outW, height: outH, fit: "fill", kernel })
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