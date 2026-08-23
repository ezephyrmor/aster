import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  processStickerImage,
  renderMockSticker,
  validateCutout,
  keepSubjectComponents,
  eraseResidualFringe,
  ProcessingError,
} from "@/lib/ai/image-processor";

/**
 * Synthetic image: opaque white background with a solid red square subject in
 * the middle, plus configurable defects (halo ring, stray dots, white artwork).
 */
async function makeRaw(opts: {
  size: number;
  square: { left: number; top: number; size: number };
  halo?: boolean;
  strayDots?: boolean;
  whiteArtwork?: boolean;
}): Promise<Buffer> {
  const { size } = opts;
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    // Distinct light-blue background so white/near-white artwork regions are
    // NOT flooded as background and must survive via artwork protection.
    buf[i * 4] = 208;
    buf[i * 4 + 1] = 226;
    buf[i * 4 + 2] = 250;
    buf[i * 4 + 3] = 255;
  }
  const set = (
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a = 255,
  ) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  };

  const { left, top, size: s } = opts.square;
  for (let y = top; y < top + s; y++) {
    for (let x = left; x < left + s; x++) set(x, y, 220, 30, 40);
  }
  if (opts.halo) {
    for (let d = -2; d < s + 2; d++) {
      set(left + d, top - 1, 250, 250, 250);
      set(left + d, top - 2, 248, 248, 248);
      set(left + d, top + s, 250, 250, 250);
      set(left + d, top + s + 1, 248, 248, 248);
      set(left - 1, top + d, 250, 250, 250);
      set(left - 2, top + d, 248, 248, 248);
      set(left + s, top + d, 250, 250, 250);
      set(left + s + 1, top + d, 248, 248, 248);
    }
  }
  if (opts.strayDots) {
    set(10, 10, 200, 200, 200);
    set(11, 10, 210, 210, 210);
    set(10, 11, 205, 205, 205);
    set(size - 12, size - 12, 240, 240, 240);
    set(size - 13, size - 12, 236, 236, 236);
  }
  if (opts.whiteArtwork) {
    // A 20px-wide white strip extending inward from the subject's right edge.
    for (let y = top; y < top + 20; y++) {
      for (let x = left + s; x < left + s + 20; x++) set(x, y, 252, 252, 252);
    }
  }

  return sharp(buf, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
}

async function toRawPng(buffer: Buffer): Promise<Uint8Array> {
  return new Uint8Array(await sharp(buffer).ensureAlpha().raw().toBuffer());
}

describe("processStickerImage — cutout cleanup", () => {
  it("produces a clean transparent PNG from a plain subject", async () => {
    const input = await makeRaw({ size: 128, square: { left: 40, top: 40, size: 48 } });
    const result = await processStickerImage(input, { canvasSize: 256, transparent: true });
    expect(result.width).toBe(256);
    expect(result.height).toBe(256);

    const raw = await toRawPng(result.buffer);
    for (const [x, y] of [[2, 2], [253, 2], [2, 253], [253, 253]]) {
      expect(raw[(y * 256 + x) * 4 + 3]).toBe(0);
    }
    let red = 0;
    for (let i = 0; i < raw.length; i += 4) {
      if (raw[i + 3] > 200 && raw[i] > 180 && raw[i + 1] < 120) red++;
    }
    expect(red).toBeGreaterThan(500);
  });

  it("removes near-white halo residue around the subject", async () => {
    const input = await makeRaw({
      size: 128,
      square: { left: 40, top: 40, size: 48 },
      halo: true,
    });
    const result = await processStickerImage(input, { canvasSize: 256, transparent: true });
    const raw = await toRawPng(result.buffer);
    const stride = 256 * 4;
    let violations = 0;
    for (let y = 2; y < 254; y++) {
      for (let x = 2; x < 254; x++) {
        const i = (y * 256 + x) * 4;
        if (raw[i + 3] <= 8) continue;
        const touches =
          raw[i - 4 + 3] <= 8 || raw[i + 4 + 3] <= 8 ||
          raw[i - stride + 3] <= 8 || raw[i + stride + 3] <= 8;
        if (!touches) continue;
        const min = Math.min(raw[i], raw[i + 1], raw[i + 2]);
        const max = Math.max(raw[i], raw[i + 1], raw[i + 2]);
        if (min >= 245 || (min >= 230 && max - min <= 24)) violations++;
      }
    }
    expect(violations).toBeLessThanOrEqual(16);
  });

  it("removes isolated stray dots", async () => {
    const input = await makeRaw({
      size: 128,
      square: { left: 40, top: 40, size: 48 },
      strayDots: true,
    });
    const result = await processStickerImage(input, { canvasSize: 256, transparent: true });
    const raw = await toRawPng(result.buffer);
    const visible = new Uint8Array(256 * 256);
    for (let p = 0; p < visible.length; p++) {
      if (raw[p * 4 + 3] >= 8) visible[p] = 1;
    }
    const seen = new Uint8Array(visible.length);
    const stack: number[] = [];
    let components = 0;
    for (let start = 0; start < visible.length; start++) {
      if (!visible[start] || seen[start]) continue;
      components++;
      stack.push(start);
      seen[start] = 1;
      while (stack.length) {
        const p = stack.pop()!;
        const x = p % 256;
        for (const q of [x > 0 ? p - 1 : -1, x < 255 ? p + 1 : -1, p - 256, p + 256]) {
          if (q >= 0 && q < visible.length && visible[q] && !seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        }
      }
    }
    expect(components).toBe(1); // only the main subject survives
  });

  it("preserves genuine thick white artwork attached to the subject", async () => {
    const input = await makeRaw({
      size: 128,
      square: { left: 32, top: 32, size: 48 },
      whiteArtwork: true,
    });
    const result = await processStickerImage(input, { canvasSize: 256, transparent: true });
    const raw = await toRawPng(result.buffer);
    let whitePixels = 0;
    for (let i = 0; i < raw.length; i += 4) {
      if (raw[i + 3] > 200 && raw[i] > 245 && raw[i + 1] > 245 && raw[i + 2] > 245) {
        whitePixels++;
      }
    }
    expect(whitePixels).toBeGreaterThan(100);
  });

  it("fails when no distinguishable subject exists", async () => {
    const input = await makeRaw({ size: 64, square: { left: -50, top: -50, size: 10 } });
    await expect(
      processStickerImage(input, { canvasSize: 128, transparent: true }),
    ).rejects.toBeInstanceOf(ProcessingError);
  });

  it("removes a non-uniform scenery-like background via tolerance escalation", async () => {
    // Simulates a model ignoring "plain backdrop": a noisy multi-colored
    // background (like leaves/corals) far from the sampled border color.
    const size = 128;
    const buf = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Varied green/blue "scenery" noise around a teal base.
        const n = ((x * 7 + y * 13) % 3) * 18;
        buf[i] = 30 + n;
        buf[i + 1] = 120 + n;
        buf[i + 2] = 110 + n;
        buf[i + 3] = 255;
      }
    }
    const set = (x: number, y: number, r: number, g: number, b: number) => {
      const i = (y * size + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
    };
    for (let y = 40; y < 88; y++) {
      for (let x = 40; x < 88; x++) set(x, y, 220, 30, 40);
    }
    const input = await sharp(buf, { raw: { width: size, height: size, channels: 4 } })
      .png()
      .toBuffer();

    const result = await processStickerImage(input, { canvasSize: 256, transparent: true });
    const raw = await toRawPng(result.buffer);
    // Corners must be fully transparent — no scenery may survive there.
    for (const [x, y] of [[2, 2], [253, 2], [2, 253], [253, 253]]) {
      expect(raw[(y * 256 + x) * 4 + 3]).toBe(0);
    }
    let greenish = 0;
    for (let i = 0; i < raw.length; i += 4) {
      if (raw[i + 3] > 200 && raw[i + 1] > raw[i] && raw[i + 1] > raw[i + 2]) greenish++;
    }
    expect(greenish).toBeLessThan(200); // subject area is ~red, not scenery
    let red = 0;
    for (let i = 0; i < raw.length; i += 4) {
      if (raw[i + 3] > 200 && raw[i] > 180 && raw[i + 1] < 120) red++;
    }
    expect(red).toBeGreaterThan(500);
  });
});

describe("keepSubjectComponents", () => {
  it("removes a large disconnected ghost blob (beyond the old 16px despeckle cap)", () => {
    const size = 64;
    const buf = Buffer.alloc(size * size * 4);
    // Large opaque red subject block in the middle.
    for (let y = 16; y < 48; y++) {
      for (let x = 16; x < 48; x++) {
        const i = (y * size + x) * 4;
        buf[i] = 220;
        buf[i + 1] = 40;
        buf[i + 2] = 40;
        buf[i + 3] = 255;
      }
    }
    // A 10x10 (100px) semi-transparent ghost blob — bigger than the old 16px
    // despeckle ceiling, so it would previously have survived as a visible
    // detached fragment. It is not opaque, so it must be removed in full.
    for (let y = 2; y < 12; y++) {
      for (let x = 2; x < 12; x++) {
        const i = (y * size + x) * 4;
        buf[i] = 200;
        buf[i + 1] = 200;
        buf[i + 2] = 200;
        buf[i + 3] = 120;
      }
    }

    const out = keepSubjectComponents(buf, size, size);
    const raw = new Uint8Array(out);
    // Ghost blob → fully transparent.
    for (let y = 2; y < 12; y++) {
      for (let x = 2; x < 12; x++) {
        expect(raw[(y * size + x) * 4 + 3]).toBe(0);
      }
    }
    // Subject intact.
    expect(raw[(24 * size + 24) * 4 + 3]).toBe(255);
  });

  it("keeps the largest subject but drops small speck components", () => {
    const size = 32;
    const buf = Buffer.alloc(size * size * 4);
    // 12x12 solid opaque subject.
    for (let y = 10; y < 22; y++) {
      for (let x = 10; x < 22; x++) {
        const i = (y * size + x) * 4;
        buf[i] = 60;
        buf[i + 1] = 120;
        buf[i + 2] = 200;
        buf[i + 3] = 255;
      }
    }
    // Two tiny opaque dots far away and not touching the subject.
    const dots = [
      [2, 2],
      [28, 28],
    ];
    for (const [dx, dy] of dots) {
      const i = (dy * size + dx) * 4;
      buf[i] = 255;
      buf[i + 1] = 255;
      buf[i + 2] = 255;
      buf[i + 3] = 255;
    }

    const out = keepSubjectComponents(buf, size, size);
    const raw = new Uint8Array(out);
    expect(raw[(11 * size + 11) * 4 + 3]).toBe(255);
    expect(raw[(2 * size + 2) * 4 + 3]).toBe(0);
    expect(raw[(28 * size + 28) * 4 + 3]).toBe(0);
  });
});

describe("eraseResidualFringe", () => {
  it("erases a low-alpha halo around the subject but keeps the opaque core", () => {
    const size = 16;
    const buf = Buffer.alloc(size * size * 4);
    const set = (x: number, y: number, r: number, g: number, b: number, a: number) => {
      const i = (y * size + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = a;
    };
    // Opaque red core (x 6..9, y 6..9).
    for (let y = 6; y < 10; y++) {
      for (let x = 6; x < 10; x++) set(x, y, 200, 30, 30, 255);
    }
    // A 1px semi-transparent halo ring (alpha 80) wrapped around the core.
    for (let y = 5; y <= 10; y++) {
      for (let x = 5; x <= 10; x++) {
        const isCore = x >= 6 && x < 10 && y >= 6 && y < 10;
        if (!isCore) set(x, y, 230, 200, 200, 80);
      }
    }

    const out = eraseResidualFringe(buf, size, size);
    const raw = new Uint8Array(out);
    // Every fringe pixel outside the core is now fully transparent.
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const a = raw[(y * size + x) * 4 + 3];
        const isCore = x >= 6 && x < 10 && y >= 6 && y < 10;
        if (isCore) {
          expect(a).toBe(255);
        } else {
          expect(a).toBe(0);
        }
      }
    }
  });
});

describe("processStickerImage — detached fragment on an already-transparent input", () => {
  it("removes a large disconnected fragment even when the provider already returns alpha", async () => {
    const size = 128;
    const buf = Buffer.alloc(size * size * 4); // default alpha 0 (transparent)
    const set = (x: number, y: number, r: number, g: number, b: number, a: number) => {
      const i = (y * size + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = a;
    };
    // Subject block (opaque red).
    for (let y = 40; y < 88; y++) {
      for (let x = 40; x < 88; x++) set(x, y, 220, 40, 40, 255);
    }
    // A large disconnected ghost blob (20x20) with partial alpha in the corner.
    for (let y = 8; y < 28; y++) {
      for (let x = 8; x < 28; x++) set(x, y, 200, 200, 200, 120);
    }

    const input = await sharp(buf, { raw: { width: size, height: size, channels: 4 } })
      .png()
      .toBuffer();
    const result = await processStickerImage(input, { canvasSize: 256, transparent: true });
    const raw = await toRawPng(result.buffer);

    // Count connected visible components — only the subject may remain.
    const visible = new Uint8Array(256 * 256);
    for (let p = 0; p < visible.length; p++) if (raw[p * 4 + 3] >= 8) visible[p] = 1;
    const seen = new Uint8Array(visible.length);
    const stack: number[] = [];
    let components = 0;
    for (let start = 0; start < visible.length; start++) {
      if (!visible[start] || seen[start]) continue;
      components++;
      stack.push(start);
      seen[start] = 1;
      while (stack.length) {
        const p = stack.pop()!;
        const x = p % 256;
        for (const q of [x > 0 ? p - 1 : -1, x < 255 ? p + 1 : -1, p - 256, p + 256]) {
          if (q >= 0 && q < visible.length && visible[q] && !seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        }
      }
    }
    expect(components).toBe(1);
  });
});

describe("validateCutout", () => {
  it("accepts a full mock-pipeline output", async () => {
    const mock = await renderMockSticker(256);
    const result = await processStickerImage(mock, { canvasSize: 256, transparent: true });
    await expect(validateCutout(result.buffer, 256)).resolves.toBeUndefined();
  });
});

