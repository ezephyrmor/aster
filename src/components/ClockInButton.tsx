"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import Modal from "@/components/Modal";

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
  const [showEarlyClockOutModal, setShowEarlyClockOutModal] = useState(false);
  const [earlyClockOutReason, setEarlyClockOutReason] = useState("");
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

  const handleClockAction = async (type: "in" | "out", reason?: string) => {
    if (!user) return;
    setActionLoading(true);

    try {
      const body: { userId: number; type: string; reason?: string } = {
        userId: user.id,
        type,
      };
      if (reason !== undefined) {
        body.reason = reason;
      }

      const response = await fetch("/api/attendance/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const handleClockOutClick = () => {
    // Always show confirmation modal for clock-out
    setShowEarlyClockOutModal(true);
  };

  const handleConfirmClockOut = async () => {
    const reason = earlyClockOutReason.trim() || undefined;
    await handleClockAction("out", reason);
    setShowEarlyClockOutModal(false);
    setEarlyClockOutReason("");
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
    <div className="relative flex items-center gap-4">
      {/* Time Card - Secondary */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <svg
          className="w-4 h-4 text-zinc-400 dark:text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
            {serverTime.standard}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
            {serverTime.date}
          </span>
        </div>
      </div>

      {/* Primary Clock Action Button */}
      {status?.canClockIn ? (
        <button
          onClick={() => handleClockAction("in")}
          disabled={actionLoading}
          title="Clock In"
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-xl bg-green-400 opacity-20 animate-pulse" />

          {actionLoading ? (
            <svg
              className="animate-spin h-5 w-5 relative z-10"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 relative z-10"
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
          )}
          <span className="relative z-10">Clock In</span>
        </button>
      ) : clockOutTime ? (
        <div
          title={`Clocked out at ${clockOutTime}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 font-semibold text-sm shadow-md"
        >
          <svg
            className="w-5 h-5"
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
          <span>Clocked Out</span>
        </div>
      ) : (
        <button
          onClick={handleClockOutClick}
          disabled={actionLoading}
          title="Clock Out"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {actionLoading ? (
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
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
          )}
          <span>Clock Out</span>
        </button>
      )}

      {/* Status Indicator - Minimal */}
      {status?.attendance && status.attendance.lateMinutes > 0 && (
        <span
          title={`${status.attendance.lateMinutes} minutes late`}
          className="text-xs text-orange-600 dark:text-orange-400 font-medium"
        >
          +{status.attendance.lateMinutes}m
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && status?.schedule && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
          Schedule: {status.schedule.startTime} - {status.schedule.endTime}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-zinc-900 dark:border-b-zinc-700" />
        </div>
      )}

      {/* Early Clock-Out Modal using reusable Modal component */}
      <Modal
        isOpen={showEarlyClockOutModal}
        onClose={() => {
          setShowEarlyClockOutModal(false);
          setEarlyClockOutReason("");
        }}
        title="Early Clock-Out"
        description="You're clocking out before your scheduled time"
        variant="warning"
        size="md"
        isLoading={actionLoading}
        footer={
          <>
            <button
              onClick={() => {
                setShowEarlyClockOutModal(false);
                setEarlyClockOutReason("");
              }}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClockOut}
              disabled={!earlyClockOutReason.trim() || actionLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Early Clock-Out"
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {status?.schedule && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-800 dark:text-orange-300">
                  Scheduled End:
                </span>
                <span className="font-semibold text-orange-900 dark:text-orange-200">
                  {status.schedule.endTime}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-orange-800 dark:text-orange-300">
                  Current Time:
                </span>
                <span className="font-semibold text-orange-900 dark:text-orange-200">
                  {serverTime.standard}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Reason for early clock-out <span className="text-red-500">*</span>
            </label>
            <textarea
              value={earlyClockOutReason}
              onChange={(e) => setEarlyClockOutReason(e.target.value)}
              placeholder="Please provide a reason for leaving early..."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
