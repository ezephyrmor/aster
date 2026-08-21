/**
 * Server-side ZIP assembly for a sticker pack download.
 * Uses `archiver`. Includes each processed PNG plus a `stickers.json` manifest.
 */
import archiver from "archiver";

export type PackManifest = {
  version: 1;
  pack: {
    name: string;
    theme: string;
    style: string;
  };
  canvas: {
    width: number;
    height: number;
    format: "png";
    transparent: boolean;
  };
  stickers: Array<{ id: string; name: string; file: string }>;
};

export type ZipStickerInput = {
  id: string;
  name: string;
  filename: string;
  data: Buffer;
};

export type BuildZipInput = {
  pack: { name: string; theme: string; style: string; transparent: boolean };
  canvasSize: number;
  stickers: ZipStickerInput[];
};

/** Build a ZIP buffer containing each sticker PNG + stickers.json manifest. */
export async function buildPackZip(input: BuildZipInput): Promise<Buffer> {
  const manifest: PackManifest = {
    version: 1,
    pack: {
      name: input.pack.name,
      theme: input.pack.theme,
      style: input.pack.style,
    },
    canvas: {
      width: input.canvasSize,
      height: input.canvasSize,
      format: "png",
      transparent: input.pack.transparent,
    },
    stickers: input.stickers.map((s) => ({
      id: s.id,
      name: s.name,
      file: s.filename,
    })),
  };

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  for (const s of input.stickers) {
    archive.append(s.data, { name: s.filename });
  }
  archive.append(JSON.stringify(manifest, null, 2), { name: "stickers.json" });

  return new Promise<Buffer>((resolve, reject) => {
    archive.on("data", (c: Buffer | string) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)),
    );
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    void archive.finalize();
  });
}