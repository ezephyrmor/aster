"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

interface AttendanceStatus {
  attendance: {
    id: number;
    clockIn: string | null;
    clockOut: string | null;
    status: string;
    lateMinutes: number;
    undertimeMinutes: number;
  } | null;
  schedule: {
    startTime: string;
    endTime: string;
    breakMinutes: number;
  } | null;
  canClockIn: boolean;
  canClockOut: boolean;
}

export default function ClockInButton() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [serverTime, setServerTime] = useState({
    standard: "",
    military: "",
    date: "",
  });

  const fetchStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/attendance/clock?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Error fetching attendance status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Update server time every second
    const updateTime = () => {
      const now = new Date();
      const standardTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const militaryTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setServerTime({
        standard: standardTime,
        military: militaryTime,
        date: dateStr,
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClockAction = async (type: "in" | "out") => {
    if (!user) return;
    setActionLoading(true);

    try {
      const response = await fetch("/api/attendance/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchStatus();
        if (type === "in") {
          addToast("Clocked in successfully!", "success");
        } else {
          addToast("Clocked out successfully!", "success");
        }
      } else {
        addToast(data.error || "Failed to process action", "error");
      }
    } catch (err) {
      console.error("Error processing clock action:", err);
      addToast("Failed to process action", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const clockInTime = status?.attendance?.clockIn
    ? formatTime(status.attendance.clockIn)
    : null;
  const clockOutTime = status?.attendance?.clockOut
    ? formatTime(status.attendance.clockOut)
    : null;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Server Time Display */}
        {serverTime.standard && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-mono">
              {serverTime.standard} / {serverTime.military}
            </span>
            <span className="ml-2">{serverTime.date}</span>
          </div>
        )}

        {status?.canClockIn ? (
          <button
            onClick={() => handleClockAction("in")}
            disabled={actionLoading}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 6v1a2 2 0 01-2 2H5a2 2 0 012-2V7a2 2 0 012-2h7a2 2 0 012 2v1"
              />
            </svg>
            Clock In
          </button>
        ) : clockOutTime ? (
          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Done
          </span>
        ) : (
          // Show Clock Out button after clocking in (disabled until eligible)
          <button
            onClick={() => handleClockAction("out")}
            disabled={true}
            className="px-3 py-1.5 bg-orange-400 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 opacity-75 cursor-not-allowed"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Clock Out (Not Yet)
          </button>
        )}

        {/* Status Info */}
        {(clockInTime ||
          (status?.attendance && status.attendance.lateMinutes > 0)) && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {clockInTime && <span>In: {clockInTime}</span>}
            {clockOutTime && <span> | Out: {clockOutTime}</span>}
            {status?.attendance && status.attendance.lateMinutes > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                {" "}
                (+{status.attendance.lateMinutes}m late)
              </span>
            )}
            {status?.attendance && status.attendance.undertimeMinutes > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                {" "}
                (-{status.attendance.undertimeMinutes}m early)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && status?.schedule && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          Schedule: {status.schedule.startTime} - {status.schedule.endTime}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-zinc-900 dark:border-b-zinc-700" />
        </div>
      )}
    </div>
  );
}
