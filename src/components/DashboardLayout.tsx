"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import ClockInButton from "@/components/ClockInButton";
import Modal from "@/components/Modal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  icon,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [remainingSessionTime, setRemainingSessionTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session, update } = useSession();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    await update();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [update]);

  // Auto refresh session on user activity
  useEffect(() => {
    const handleUserActivity = () => {
      // Only refresh if we're below updateAge threshold (5 seconds)
      if (remainingSessionTime <= 5 && remainingSessionTime > 0) {
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

  // Real-time session timer for debugging
  useEffect(() => {
    if (!session?.expires) return;

    const updateTimer = () => {
      const expiryTime = new Date(session.expires).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setRemainingSessionTime(remaining);

      // Auto redirect when session expires
      if (remaining <= 0) {
        router.push("/login");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar - Fixed width, full height */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white dark:bg-zinc-800 shadow-lg border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    {icon || (
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
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ClockInButton />

                  {/* Session Timer (Debug) */}
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
                      ⏱ {isRefreshing ? "↻" : remainingSessionTime}s
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

                  <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="relative">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                    >
                      {user && (
                        <>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                            {(user?.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <svg
                            className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-800 shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {user?.username}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {user?.role?.name}
                          </p>
                        </div>
                        <div className="p-1">
                          {user?.role?.name?.toLowerCase() === "admin" && (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                setShowSessionModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              <span>Session</span>
                            </button>
                          )}
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isLoggingOut ? (
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
                            ) : (
                              <svg
                                className="h-4 w-4"
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
                            <span>
                              {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Session Debug Modal */}
                    <Modal
                      isOpen={showSessionModal}
                      onClose={() => setShowSessionModal(false)}
                      title="Current Session Data"
                    >
                      <div className="space-y-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-auto max-h-96">
                          <pre className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                            {JSON.stringify(
                              {
                                user: session?.user,
                                expires: session?.expires,
                                authenticated: !!session,
                                timestamp: new Date().toISOString(),
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                        <button
                          onClick={() => setShowSessionModal(false)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </Modal>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
