"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import DashboardLayout from "@/components/DashboardLayout";
import CalendarWidget from "@/components/CalendarWidget";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();

  // Attendance status state
  const [attendanceStatus, setAttendanceStatus] = useState<{
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
  } | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch attendance status
  const fetchAttendanceStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/attendance/clock?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data);
      }
    } catch (err) {
      console.error("Error fetching attendance status:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [user]);

  // Handle clock in/out
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
        fetchAttendanceStatus();
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

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome to your workspace"
      icon={
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      }
    >
      {/* Top Row: Welcome, Calendar, Account Info + Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-700 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {(user?.username || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Welcome back, {user?.username || "User"}!
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  You are logged in.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Secure
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="lg:col-span-1">
          <CalendarWidget userId={user.id} />
        </div>

        {/* User Info Card + Today's Attendance */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Account Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    User ID
                  </div>
                  <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    #{user.id}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Username
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {user.username}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Status
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    <svg
                      className="w-3 h-3 mr-1.5"
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
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Attendance */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Today's Attendance
              </h3>

              {attendanceLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin h-6 w-6 border-4 border-zinc-300 border-t-blue-500 rounded-full" />
                </div>
              ) : attendanceStatus?.attendance?.clockIn ? (
                <div className="space-y-3">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attendanceStatus.attendance.clockOut
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : attendanceStatus.attendance.clockIn
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {attendanceStatus.attendance.clockOut
                        ? "Clocked Out"
                        : attendanceStatus.attendance.clockIn
                          ? "Clocked In"
                          : "Not Clocked In"}
                    </span>
                    {attendanceStatus.attendance.lateMinutes > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        +{attendanceStatus.attendance.lateMinutes}m late
                      </span>
                    )}
                    {attendanceStatus.attendance.undertimeMinutes > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        -{attendanceStatus.attendance.undertimeMinutes}m early
                      </span>
                    )}
                  </div>

                  {/* Time Details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Clock In
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatTime(attendanceStatus.attendance.clockIn)}
                      </p>
                    </div>
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Clock Out
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatTime(attendanceStatus.attendance.clockOut)}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  {attendanceStatus.schedule && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {attendanceStatus.schedule.startTime} -{" "}
                        {attendanceStatus.schedule.endTime}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No attendance record for today.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Last Login
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Today
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Account Type
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Admin
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Security
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Protected
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
