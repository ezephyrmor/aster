"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/lib/toast";
import ConfigForm from "./ConfigForm";
import ItemListEditor from "./ItemListEditor";
import ResultGrid from "./ResultGrid";
import type { PackConfig, ClientItem, StickerAssetDTO } from "./types";
import { DEFAULT_PACK_CONFIG, type StickerPackDTO } from "./types";

const CONCURRENCY = 3;

export default function StickerGeneratorBoard({
  defaultProvider,
  defaultPackName,
}: {
  defaultProvider?: string;
  defaultPackName?: string;
}) {
  const toast = useToast();
  const [config, setConfig] = useState<PackConfig>({
    ...DEFAULT_PACK_CONFIG,
    provider: defaultProvider || DEFAULT_PACK_CONFIG.provider,
    name: defaultPackName || DEFAULT_PACK_CONFIG.name,
  });
  const [items, setItems] = useState<ClientItem[]>([]);
  const [packId, setPackId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef(false);

  const patchItem = useCallback((key: string, patch: Partial<ClientItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }, []);

  const createPack = useCallback(async (): Promise<StickerPackDTO> => {
    const res = await fetch("/api/ai/stickers/pack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...config,
        items: items
          .filter((it) => it.name.trim())
          .map((it) => ({
            name: it.name.trim(),
            instructions: it.instructions || undefined,
            negativeInstructions: it.negativeInstructions || undefined,
          })),
      }),
    });
    if (!res.ok) throw new Error("Failed to create pack");
    return (await res.json()) as StickerPackDTO;
  }, [config, items]);

  const generateOne = useCallback(
    async (item: ClientItem, pid: string, itemId: string) => {
      patchItem(item.key, { status: "generating", error: null, id: itemId });
      try {
        const res = await fetch("/api/ai/stickers/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId: pid, itemId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Generation failed");
        }
        patchItem(item.key, {
          status: "completed",
          error: null,
          asset: {
            itemId: data.itemId,
            filename: data.filename,
            width: data.width,
            height: data.height,
            v: Date.now(), // bust the browser cache so the new image renders
          } as StickerAssetDTO,
        });
      } catch (err) {
        patchItem(item.key, { status: "failed", error: (err as Error).message || "Failed" });
      }
    },
    [patchItem],
  );

  // Targets carry an explicit, already-resolved server id — never a stale ref.
  const runBatch = useCallback(
    async (targets: Array<{ item: ClientItem; itemId: string }>, pid: string) => {
      setGenerating(true);
      abortRef.current = false;
      let index = 0;
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (index < targets.length && !abortRef.current) {
          const { item, itemId } = targets[index++];
          await generateOne(item, pid, itemId);
        }
      });
      await Promise.all(workers);
      setGenerating(false);
    },
    [generateOne],
  );

  const handleCreateAndGenerate = async () => {
    const viable = items.filter((it) => it.name.trim());
    if (viable.length === 0) {
      toast.addToast("Add at least one sticker item.", "warning");
      return;
    }
    toast.addToast(`Generating ${viable.length} stickers…`, "info");
    try {
      const pack = await createPack();
      setPackId(pack.id);

      // Resolve client rows → server ids synchronously (match by name, first
      // unused match so duplicate names can't collide). The SAME resolved pairs
      // are used for both state and the batch, so no stale-id race is possible.
      const used = new Set<string>();
      const resolved: Array<{ item: ClientItem; itemId: string }> = [];
      for (const row of viable) {
        const server = pack.items.find(
          (s) => s.name.trim().toLowerCase() === row.name.trim().toLowerCase() && !used.has(s.id),
        );
        if (server) {
          used.add(server.id);
          resolved.push({ item: row, itemId: server.id });
        }
      }
      if (resolved.length === 0) {
        throw new Error("The pack was created without any items — please try again.");
      }

      setItems((prev) =>
        prev.map((it) => {
          const match = resolved.find((r) => r.item.key === it.key);
          return match ? { ...it, id: match.itemId } : it;
        }),
      );
      await runBatch(resolved, pack.id);
      toast.addToast("Batch complete.", "success");
    } catch (error) {
      toast.addToast((error as Error).message || "Failed to start batch", "error");
    }
  };

  const handleRegenerate = async (key: string) => {
    const item = items.find((it) => it.key === key);
    if (!item || !packId || !item.id) return;
    // Persist any local edits first so this regeneration uses them (spec:
    // per-item instructions apply only to that item).
    try {
      await fetch(`/api/ai/stickers/pack/${packId}/item/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name.trim(),
          instructions: item.instructions || undefined,
          negativeInstructions: item.negativeInstructions || undefined,
        }),
      });
    } catch {
      // Non-fatal: regenerate with the last persisted instructions.
    }
    await runBatch([{ item, itemId: item.id }], packId);
  };

  const handleRetryFailed = async () => {
    if (!packId) return;
    const targets = items
      .filter((it) => it.status === "failed" && it.id)
      .map((item) => ({ item, itemId: item.id! }));
    if (targets.length === 0) return;
    await runBatch(targets, packId);
  };

  const handleDelete = async (key: string) => {
    const item = items.find((it) => it.key === key);
    if (!item || !packId || !item.asset) {
      setItems((prev) => prev.filter((it) => it.key !== key));
      return;
    }
    try {
      await fetch(`/api/ai/stickers/pack/${packId}/asset/${item.asset.itemId}`, { method: "DELETE" });
      setItems((prev) => prev.map((it) => (it.key === key ? { ...it, status: "pending", asset: null, error: null } : it)));
      toast.addToast(`${item.name} deleted.`, "success");
    } catch {
      toast.addToast("Failed to delete sticker.", "error");
    }
  };

  const handleDownloadZip = async () => {
    if (!packId) return;
    try {
      const res = await fetch(`/api/ai/stickers/pack/${packId}/zip`);
      if (!res.ok) throw new Error("Failed to build zip");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "stickers"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.addToast((error as Error).message || "Failed to download zip", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Configure Pack + Sticker Items side by side (6/6) */}
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <ConfigForm value={config} onChange={setConfig} onSubmit={handleCreateAndGenerate} />
        <ItemListEditor items={items} onItemsChange={setItems} theme={config.theme} />
      </div>
      {items.filter((it) => it.name.trim()).length > 0 && (
        <ResultGrid
          items={items}
          packId={packId}
          onRegenerate={handleRegenerate}
          onDelete={handleDelete}
          onDownloadZip={handleDownloadZip}
          onRetryFailed={handleRetryFailed}
          generating={generating}
        />
      )}
    </div>
  );
}