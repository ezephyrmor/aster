"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClientItem } from "./types";

interface ItemListEditorProps {
  items: ClientItem[];
  onItemsChange: (items: ClientItem[]) => void;
  theme: string;
}

let localKeyCounter = 0;
function nextKey() {
  return `client-${Date.now()}-${localKeyCounter++}`;
}

export default function ItemListEditor({ items, onItemsChange, theme }: ItemListEditorProps) {
  const [suggestCount, setSuggestCount] = useState(6);
  const [suggesting, setSuggesting] = useState(false);

  const update = (key: string, patch: Partial<ClientItem>) =>
    onItemsChange(items.map((it) => (it.key === key ? { ...it, ...patch, destroyed: false } : it)));

  const addItem = () =>
    onItemsChange([
      ...items,
      { key: nextKey(), name: "", instructions: "", negativeInstructions: "", status: "pending" },
    ]);

  const removeItem = (key: string) => onItemsChange(items.filter((it) => it.key !== key));

  const applySuggestions = (names: string[]) => {
    const fresh = names.map((n) => ({
      key: nextKey(),
      name: n,
      instructions: "",
      negativeInstructions: "",
      status: "pending" as const,
    }));
    onItemsChange([...items, ...fresh]);
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/stickers/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, count: suggestCount }),
      });
      const data = await res.json();
      if (res.ok && data.suggestions) {
        applySuggestions(data.suggestions);
      }
    } catch {
      // best-effort; the user can still add items manually
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">2 · Sticker Items</h2>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={20}
            value={suggestCount}
            onChange={(e) => setSuggestCount(Number(e.target.value))}
            className="!w-20"
            aria-label="Suggestion count"
          />
          <Button variant="outline" onClick={handleSuggest} disabled={suggesting} size="sm">
            {suggesting ? "Suggesting…" : "Suggest Items"}
          </Button>
          <Button variant="green" onClick={addItem} size="sm">
            + Add
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No items yet. Add a sticker item (e.g. “coffee mug”) or use Suggest Items.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key} className="rounded-md border border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={item.name}
                  onChange={(e) => update(item.key, { name: e.target.value })}
                  placeholder="Sticker item name"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon-sm" onClick={() => removeItem(item.key)} aria-label="Remove item">
                  ✕
                </Button>
              </div>
              <details className="text-xs text-zinc-600 dark:text-zinc-400">
                <summary className="cursor-pointer select-none font-medium">
                  Optional instructions
                  {(item.instructions || item.negativeInstructions) && (
                    <span className="ml-1 text-blue-500 dark:text-blue-400">• set</span>
                  )}
                </summary>
                <div className="mt-2 space-y-2">
                  <textarea
                    value={item.instructions}
                    onChange={(e) => update(item.key, { instructions: e.target.value })}
                    rows={1}
                    placeholder="Custom instructions for this item"
                    className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                  />
                  <textarea
                    value={item.negativeInstructions}
                    onChange={(e) => update(item.key, { negativeInstructions: e.target.value })}
                    rows={1}
                    placeholder="Additional negative prompt for this item"
                    className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                  />
                </div>
              </details>
              {item.status === "failed" && item.error && (
                <p className="text-xs text-red-600 dark:text-red-400">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}