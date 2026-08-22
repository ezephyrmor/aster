"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast";
import { Checkerboard } from "./ResultGrid";
import type { PackSummaryDTO, StickerItemDTO } from "./types";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  generating: "Generating",
  processing: "Processing",
  completed: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BatchesBrowser() {
  const toast = useToast();
  const [packs, setPacks] = useState<PackSummaryDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PackSummaryDTO | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadPacks = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/ai/stickers/pack");
      if (res.ok) {
        const data = await res.json();
        setPacks((data.packs ?? []) as PackSummaryDTO[]);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/ai/stickers/pack/${id}`);
      if (res.ok) setDetail((await res.json()) as PackSummaryDTO);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadPacks();
  }, [loadPacks]);

  const selectPack = (id: string) => {
    setSelectedId(id);
    setDetail(null);
    void loadDetail(id);
  };

  const handleDeletePack = async (id: string) => {
    const pack = packs.find((p) => p.id === id);
    if (!window.confirm(`Delete pack "${pack?.name ?? id}" and all its stickers?`)) return;
    try {
      const res = await fetch(`/api/ai/stickers/pack/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.addToast("Pack deleted.", "success");
      if (selectedId === id) {
        setSelectedId(null);
        setDetail(null);
      }
      await loadPacks();
    } catch {
      toast.addToast("Failed to delete pack.", "error");
    }
  };

  const handleDownloadZip = async () => {
    if (!detail) return;
    try {
      const res = await fetch(`/api/ai/stickers/pack/${detail.id}/zip`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${detail.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "stickers"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.addToast("Failed to build ZIP.", "error");
    }
  };

  const detailItems = detail?.items ?? [];
  const completedCount = detailItems.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Pack list */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Generated Batches</h2>
          <Button variant="outline" size="sm" onClick={() => void loadPacks()} disabled={loadingList}>
            {loadingList ? "Loading…" : "Refresh"}
          </Button>
        </div>

        {!loadingList && packs.length === 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No batches yet — generate a pack in the Generator tab and it will appear here.
          </p>
        )}

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => selectPack(p.id)}
                className={`w-full text-left rounded-md border p-3 transition-colors ${
                  selectedId === p.id
                    ? "border-blue-500 bg-blue-50 dark:bg-zinc-700"
                    : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
                }`}
              >
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{p.name}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {p.theme} · {p.style} · {p.provider ?? "mock"}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {p._count?.items ?? 0} stickers · {formatDate(p.createdAt)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected pack detail */}
      {selectedId && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {detail?.name ?? "Pack"}
              </h3>
              {detail && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {completedCount} / {detailItems.length} ready ·{" "}
                  {detail.transparent ? "transparent" : "opaque"} · {detail.size}px ·{" "}
                  {detail.provider ?? "mock"} · {formatDate(detail.createdAt)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="blue" size="sm" onClick={handleDownloadZip} disabled={completedCount === 0}>
                Download ZIP
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeletePack(detail!.id)}>
                Delete Pack
              </Button>
            </div>
          </div>

          {loadingDetail ? (
            <p className="text-xs text-zinc-500">Loading stickers…</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {detailItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 p-2 space-y-1.5"
                >
                  {item.asset ? (
                    <Checkerboard
                      src={`/api/ai/stickers/pack/${detail!.id}/asset/${item.id}`}
                      alt={item.name}
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] uppercase text-zinc-400">
                      {statusLabel[item.status] ?? item.status}
                    </div>
                  )}
                  <div
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </div>
                  {item.asset && (
                    <a
                      href={`/api/ai/stickers/pack/${detail!.id}/asset/${item.id}`}
                      download={item.asset.filename}
                      className="inline-flex rounded-md bg-zinc-100 dark:bg-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                    >
                      Download PNG
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}