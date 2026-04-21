"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SESSION_CONFIG } from "@/config";

/**
 * Session Timer Component
 *
 * Displays real-time session countdown with proper time formatting,
 * automatic refresh on user activity, and manual refresh button.
 *
 * Color coded status indicators:
 * - Green: > 10 seconds remaining
 * - Yellow: 5-10 seconds remaining
 * - Red: < 5 seconds remaining (pulsing animation)
 */
export default function SessionTimer() {
  const { data: session, update } = useSession();
  const [remainingSessionTime, setRemainingSessionTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Formats seconds into human readable time string
   * Automatically uses appropriate units: seconds, minutes, hours
   * Skips zero values and handles proper singular/plural labels
   */
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} ${seconds === 1 ? "sec" : "secs"}`;
    }

    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;

      const minuteLabel = mins === 1 ? "min" : "mins";
      const secondLabel = secs === 1 ? "sec" : "secs";

      if (secs === 0) {
        return `${mins} ${minuteLabel}`;
      }

      return `${mins} ${minuteLabel} ${secs} ${secondLabel}`;
    }

    // Hours handling
    const hrs = Math.floor(seconds / 3600);
    const remaining = seconds % 3600;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    const hourLabel = hrs === 1 ? "hr" : "hrs";
    const minuteLabel = mins === 1 ? "min" : "mins";
    const secondLabel = secs === 1 ? "sec" : "secs";

    const parts: string[] = [];

    parts.push(`${hrs} ${hourLabel}`);
    if (mins > 0) parts.push(`${mins} ${minuteLabel}`);
    if (secs > 0) parts.push(`${secs} ${secondLabel}`);

    return parts.join(" ");
  };

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    await update();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [update]);

  // Auto refresh session on user activity
  useEffect(() => {
    const handleUserActivity = () => {
      // Only refresh if we're below auto refresh threshold
      if (
        remainingSessionTime <= SESSION_CONFIG.autoRefreshThreshold &&
        remainingSessionTime > 0
      ) {
        refreshSession();
      }
    };

    // Listen for user activity events
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("keypress", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("keypress", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, [remainingSessionTime, refreshSession]);

  // Real-time session timer
  useEffect(() => {
    if (!session?.expires) return;

    const updateTimer = () => {
      const expiryTime = new Date(session.expires).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setRemainingSessionTime(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`px-3 py-1 rounded-md font-mono text-sm font-bold transition-all ${
          isRefreshing
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            : remainingSessionTime > 10
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : remainingSessionTime > 5
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 animate-pulse"
        }`}
      >
        ⏱ {isRefreshing ? "↻" : formatTime(remainingSessionTime)}
      </div>

      {/* Manual Refresh Button */}
      <button
        onClick={refreshSession}
        disabled={isRefreshing}
        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
        title="Refresh Session"
      >
        <svg
          className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 ${isRefreshing ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
}
