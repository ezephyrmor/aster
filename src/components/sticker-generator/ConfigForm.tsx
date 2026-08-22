"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PackConfig } from "./types";
import { STICKER_THEMES, STICKER_DISPLAY_STYLES } from "./presets-client";
import { STICKER_SIZES } from "@/lib/validations";

type ProviderInfo = { id: string; configured: boolean };

/** Static fallback until the server tells us what's actually configured. */
const FALLBACK_PROVIDERS: ProviderInfo[] = [
  "mock",
  "openai",
  "stability",
  "google",
  "openrouter",
  "huggingface",
].map((id) => ({ id, configured: true }));

export const STICKER_PROVIDER_OPTIONS = FALLBACK_PROVIDERS.map((p) => p.id);

interface ConfigFormProps {
  value: PackConfig;
  onChange: (next: PackConfig) => void;
  onSubmit: () => void;
}

export default function ConfigForm({ value, onChange, onSubmit }: ConfigFormProps) {
  const set = (patch: Partial<PackConfig>) => onChange({ ...value, ...patch });

  // Ask the server which providers have keys configured — switching providers
  // is then purely a UI decision (per pack); .env only holds the keys once.
  const [providers, setProviders] = useState<ProviderInfo[]>(FALLBACK_PROVIDERS);
  const [serverDefault, setServerDefault] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/stickers/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.providers) return;
        setProviders(data.providers as ProviderInfo[]);
        if (data.defaultProvider) setServerDefault(data.defaultProvider as string);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedInfo = providers.find((p) => p.id === value.provider);

  /** Env var name per provider — for the "no key" hint only. */
  function keyEnvName(provider: string): string {
    switch (provider) {
      case "openai":
        return "OPENAI_API_KEY";
      case "stability":
        return "STABILITY_API_KEY";
      case "google":
        return "GOOGLE_API_KEY";
      case "openrouter":
        return "OPENROUTER_API_KEY";
      case "huggingface":
        return "HUGGINGFACE_API_KEY";
      default:
        return "AI_PROVIDER";
    }
  }

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
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
                {p.id === serverDefault ? " (default)" : ""}
                {!p.configured && p.id !== "mock" ? " — no API key" : ""}
              </option>
            ))}
          </select>
        </label>

        {value.provider === "mock" && (
          <p className="sm:col-span-2 -mt-2 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
            ⚠️ Mock renders a placeholder image (a blue box) without calling any AI.
            Pick a real provider above to generate actual stickers.
          </p>
        )}

        {value.provider !== "mock" && selectedInfo && !selectedInfo.configured && (
          <p className="sm:col-span-2 -mt-2 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
            ⚠️ The server has no API key for <code>{value.provider}</code> yet.
            Add <code>{keyEnvName(value.provider)}</code> to <code>.env</code> and
            restart — then this batch will call the real model.
          </p>
        )}

        <label className="block text-xs text-zinc-600 dark:text-zinc-400">
          Output size (px)
          <select
            value={value.size}
            onChange={(e) => set({ size: Number(e.target.value) })}
            className="mt-1 h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
          >
            {STICKER_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} × {s}
              </option>
            ))}
          </select>
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