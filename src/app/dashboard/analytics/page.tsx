"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTeams: number;
  totalBrands: number;
  attendanceToday: number;
  pendingLeaves: number;
  pendingInfractions: number;
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const stats = [
    {
      name: "Total Users",
      value: (analytics?.totalUsers || 0).toString(),
      change: `${analytics?.activeUsers || 0} active`,
      changeType: "neutral",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      name: "Total Teams",
      value: (analytics?.totalTeams || 0).toString(),
      change: "Teams configured",
      changeType: "neutral",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      name: "Total Brands",
      value: (analytics?.totalBrands || 0).toString(),
      change: "Brands managed",
      changeType: "neutral",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      color: "purple",
    },
    {
      name: "Pending Leaves",
      value: (analytics?.pendingLeaves || 0).toString(),
      change: "Awaiting approval",
      changeType: "neutral",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const classes: Record<string, { bg: string; text: string; light: string }> =
      {
        blue: {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          light: "bg-blue-50 dark:bg-blue-900/20",
        },
        green: {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          light: "bg-green-50 dark:bg-green-900/20",
        },
        purple: {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-600 dark:text-purple-400",
          light: "bg-purple-50 dark:bg-purple-900/20",
        },
        orange: {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-600 dark:text-orange-400",
          light: "bg-orange-50 dark:bg-orange-900/20",
        },
      };
    return classes[color] || classes.blue;
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Loading analytics data...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="View your platform performance and metrics"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${colors.bg} p-3 rounded-lg`}>
                  <div className={colors.text}>{stat.icon}</div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "increase"
                      ? "text-green-600 dark:text-green-400"
                      : stat.changeType === "decrease"
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Active Users
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {analytics?.activeUsers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Total Teams
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {analytics?.totalTeams || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Total Brands
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {analytics?.totalBrands || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Attendance Today
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {analytics?.attendanceToday || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Pending Items
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Pending Leave Requests
                </span>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Awaiting manager approval
                </p>
              </div>
              <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {analytics?.pendingLeaves || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div>
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  Pending Infractions
                </span>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Requires review
                </p>
              </div>
              <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                {analytics?.pendingInfractions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
