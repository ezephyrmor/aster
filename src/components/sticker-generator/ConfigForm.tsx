"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PackConfig } from "./types";
import { STICKER_THEMES, STICKER_DISPLAY_STYLES } from "./presets-client";

export const STICKER_PROVIDER_OPTIONS = ["mock", "openai", "stability", "google", "openrouter"];

interface ConfigFormProps {
  value: PackConfig;
  onChange: (next: PackConfig) => void;
  onSubmit: () => void;
}

export default function ConfigForm({ value, onChange, onSubmit }: ConfigFormProps) {
  const set = (patch: Partial<PackConfig>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">1 · Configure Pack</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          Pack name
          <Input
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Cozy Study Pack"
            className="mt-1"
          />
        </label>

        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          Theme
          <select
            value={value.theme}
            onChange={(e) => set({ theme: e.target.value })}
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
          >
            {Object.entries(STICKER_THEMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label[0].toUpperCase() + label.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          Style
          <select
            value={value.style}
            onChange={(e) => set({ style: e.target.value })}
            className="mt-1 h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
          >
            {Object.entries(STICKER_DISPLAY_STYLES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </label>

        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          AI Provider
          <select
            value={value.provider}
            onChange={(e) => set({ provider: e.target.value })}
            className="mt-1 h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
          >
            {STICKER_PROVIDER_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          Sticker count
          <Input
            type="number"
            min={1}
            max={24}
            value={value.count}
            onChange={(e) => set({ count: Number(e.target.value) })}
            className="mt-1"
          />
        </label>

        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          Size (px)
          <Input type="number" value={value.size} onChange={(e) => set({ size: Number(e.target.value) })} className="mt-1" disabled readOnly aria-disabled title="Fixed at 1024" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={value.transparent}
            onChange={(e) => set({ transparent: e.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          Transparent background
        </label>
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={value.outline}
            onChange={(e) => set({ outline: e.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          White outline
        </label>
      </div>

      <label className="block text-xs text-zinc-600 dark:text-zinc-400">
        Batch-wide instructions (optional)
        <textarea
          value={value.batchInstructions}
          onChange={(e) => set({ batchInstructions: e.target.value })}
          rows={2}
          placeholder="e.g. keep everything rounded and soft"
          className="mt-1 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
        />
      </label>

      <details className="text-xs text-zinc-600 dark:text-zinc-400">
        <summary className="cursor-pointer font-medium">Advanced — Additional Negative Prompt</summary>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Appended to the system negative prompt (never replaces it).
        </p>
        <textarea
          value={value.negativePrompt}
          onChange={(e) => set({ negativePrompt: e.target.value })}
          rows={2}
          placeholder="avoid shiny plastic, avoid sparkles"
          className="mt-1 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
        />
      </details>

      <Button variant="blue" onClick={onSubmit} className="w-full">
        Continue to Items
      </Button>
    </div>
  );
}