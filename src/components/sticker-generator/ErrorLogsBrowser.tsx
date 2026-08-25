"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ErrorLogDTO } from "./types";

const PAGE_SIZE = 12;

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

export default function ErrorLogsBrowser() {
  const [logs, setLogs] = useState<ErrorLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/ai/stickers/errors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs((data.logs ?? []) as ErrorLogDTO[]);
        setPage(data.pagination?.page ?? targetPage);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Generation Errors
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Failed sticker generations across your batches.
          </p>
        </div>
        <Button
          variant="green"
          size="sm"
          onClick={() => void loadLogs(page)}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading errors…</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No generation errors. 🎉
        </p>
      ) : (
        <>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {logs.map((log) => (
              <li key={log.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {log.sticker}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(log.updatedAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {log.packName ?? "Unknown pack"}
                  {log.theme ? ` · ${log.theme}` : ""} · {log.provider}
                </p>
                <p className="mt-1 text-xs break-words text-red-600 dark:text-red-400">
                  {log.error}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{total} error{total === 1 ? "" : "s"}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => void loadLogs(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span>Page {page} of {Math.max(1, totalPages)}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => void loadLogs(page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}