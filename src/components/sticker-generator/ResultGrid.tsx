"use client";

import { Button } from "@/components/ui/button";
import type { ClientItem } from "./types";

interface ResultGridProps {
  items: ClientItem[];
  packId: string | null;
  onRegenerate: (key: string) => void;
  onDelete: (key: string) => void;
  onDownloadZip: () => void;
  onRetryFailed: () => void;
  generating: boolean;
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  generating: "Generating",
  processing: "Processing",
  completed: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
};

/** Shared transparent-preview tile (checkerboard is UI-only, never baked in). */
export function Checkerboard({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="w-full aspect-square rounded-md overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(45deg,#e0e0e0 25%,transparent 25%),linear-gradient(-45deg,#e0e0e0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e0e0e0 75%),linear-gradient(-45deg,transparent 75%,#e0e0e0 75%)",
        backgroundSize: "12px 12px",
        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
        backgroundColor: "#ffffff",
      }}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}

const assetUrl = (packId: string | null, item: ClientItem, download = false): string => {
  if (!packId || !item.asset) return "#";
  const base = `/api/ai/stickers/pack/${packId}/asset/${item.asset.itemId}`;
  return item.asset.v ? `${base}?v=${item.asset.v}${download ? "&dl=1" : ""}` : base;
};

export default function ResultGrid({
  items,
  packId,
  onRegenerate,
  onDelete,
  onDownloadZip,
  onRetryFailed,
  generating,
}: ResultGridProps) {
  const ready = items.filter((it) => it.status === "completed").length;
  const failed = items.filter((it) => it.status === "failed").length;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">3 · Results</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {ready} / {items.length} ready{failed > 0 ? ` · ${failed} failed` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {failed > 0 && (
            <Button variant="outline" size="sm" onClick={onRetryFailed} disabled={generating}>
              Retry Failed
            </Button>
          )}
          <Button
            variant="blue"
            size="sm"
            onClick={onDownloadZip}
            disabled={ready === 0 || !packId}
          >
            Download All as ZIP
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate a batch to see results here.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <li key={item.key} className="rounded-md border border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
              {item.asset ? (
                <Checkerboard
                  src={assetUrl(packId, item)}
                  alt={item.name}
                />
              ) : (
                <div className="w-full aspect-square rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-400 uppercase tracking-wide">
                  {statusLabel[item.status] ?? item.status}
                </div>
              )}
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate" title={item.name}>
                {item.name}
              </div>
              <div
                className={`text-[10px] uppercase tracking-wide ${
                  item.status === "completed"
                    ? "text-green-600 dark:text-green-400"
                    : item.status === "failed"
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-400"
                }`}
              >
                {statusLabel[item.status] ?? item.status}
              </div>
              {item.error && (
                <div className="text-[10px] text-red-500 break-words whitespace-pre-line leading-snug max-h-24 overflow-y-auto">
                  {item.error}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {item.asset && packId && (
                  <a
                    href={assetUrl(packId, item, true)}
                    download={item.asset.filename}
                    className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                  >
                    Download
                  </a>
                )}
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onRegenerate(item.key)}
                  disabled={generating || (item.status !== "failed" && item.status !== "completed")}
                >
                  Regenerate
                </Button>
                <Button variant="ghost" size="xs" onClick={() => onDelete(item.key)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}