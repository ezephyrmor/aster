"use client";

import { useState } from "react";
import StickerGeneratorBoard from "./StickerGeneratorBoard";
import BatchesBrowser from "./BatchesBrowser";
import ErrorLogsBrowser from "./ErrorLogsBrowser";

type Tab = "generator" | "batches" | "errors";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "generator", label: "Generator" },
  { id: "batches", label: "My Batches" },
  { id: "errors", label: "Error Logs" },
];

interface StickerGeneratorTabsProps {
  /** Server-resolved default provider (from AI_PROVIDER env, fallback mock). */
  defaultProvider: string;
  /** Server-computed md5(timestamp) seed for the initial pack name. */
  defaultPackName: string;
}

export default function StickerGeneratorTabs({
  defaultProvider,
  defaultPackName,
}: StickerGeneratorTabsProps) {
  const [tab, setTab] = useState<Tab>("generator");

  return (
    <>
      {/* Tab bar */}
      <div className="mb-4 inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.id
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "generator" ? (
        <StickerGeneratorBoard
          defaultProvider={defaultProvider}
          defaultPackName={defaultPackName}
        />
      ) : tab === "batches" ? (
        <BatchesBrowser />
      ) : (
        <ErrorLogsBrowser />
      )}
    </>
  );
}