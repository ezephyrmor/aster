"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";

interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalEmployees: number;
    totalBrands: number;
    totalTeams: number;
    activeBrands: number;
    inactiveBrands: number;
    activeTeamMembers: number;
    inactiveTeamMembers: number;
    averageTeamSize: string;
  };
  growth: {
    newUsersThisMonth: number;
    newBrandsThisMonth: number;
    newTeamsThisMonth: number;
  };
  recentActivity: Array<{
    id: number;
    action: string;
    description: string;
    time: string;
    type: string;
  }>;
  distributions: {
    brandsByIndustry: Array<{ name: string; count: number }>;
    usersByRole: Array<{ name: string; count: number }>;
    teamsPerBrand: Array<{ name: string; count: number }>;
  };
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
      value: analytics?.stats.totalUsers.toString() || "0",
      change: `+${analytics?.growth.newUsersThisMonth || 0} this month`,
      changeType: "increase",
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
      name: "Total Employees",
      value: analytics?.stats.totalEmployees.toString() || "0",
      change: "Employee profiles",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      name: "Total Brands",
      value: analytics?.stats.totalBrands.toString() || "0",
      change: `${analytics?.stats.activeBrands || 0} active`,
      changeType: "increase",
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
      name: "Total Teams",
      value: analytics?.stats.totalTeams.toString() || "0",
      change: `Avg ${analytics?.stats.averageTeamSize || "0"} members`,
      changeType: "increase",
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return (
          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
        );
      case "team":
        return (
          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600 dark:text-green-400"
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
          </div>
        );
      default:
        return null;
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {analytics?.recentActivity &&
            analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {activity.description}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {activity.time}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Members Status */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-purple-500"
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
            Team Members
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Active Members
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {analytics?.stats.activeTeamMembers || 0}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width:
                      analytics?.stats.activeTeamMembers &&
                      analytics?.stats.activeTeamMembers +
                        analytics?.stats.inactiveTeamMembers
                        ? `${(analytics.stats.activeTeamMembers / (analytics.stats.activeTeamMembers + analytics.stats.inactiveTeamMembers)) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Inactive Members
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {analytics?.stats.inactiveTeamMembers || 0}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width:
                      analytics?.stats.inactiveTeamMembers &&
                      analytics?.stats.activeTeamMembers +
                        analytics?.stats.inactiveTeamMembers
                        ? `${(analytics.stats.inactiveTeamMembers / (analytics.stats.activeTeamMembers + analytics.stats.inactiveTeamMembers)) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Brands by Industry */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            Brands by Industry
          </h3>
          <div className="space-y-4">
            {analytics?.distributions.brandsByIndustry &&
            analytics.distributions.brandsByIndustry.length > 0 ? (
              analytics.distributions.brandsByIndustry.map(
                (industry, index) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-green-500",
                    "bg-orange-500",
                    "bg-red-500",
                  ];
                  return (
                    <div
                      key={industry.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}
                        />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {industry.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {industry.count}
                      </span>
                    </div>
                  );
                },
              )
            ) : (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <p>No industry data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Users by Role */}
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
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Users by Role
          </h3>
          <div className="space-y-4">
            {analytics?.distributions.usersByRole &&
            analytics.distributions.usersByRole.length > 0 ? (
              analytics.distributions.usersByRole.map((role, index) => {
                const colors = [
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-green-500",
                  "bg-orange-500",
                  "bg-red-500",
                ];
                return (
                  <div
                    key={role.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}
                      />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {role.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {role.count}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <p>No role data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teams per Brand */}
      {analytics?.distributions.teamsPerBrand &&
        analytics.distributions.teamsPerBrand.length > 0 && (
          <div className="mt-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
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
              Teams per Brand
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.distributions.teamsPerBrand.map((brand) => (
                <div
                  key={brand.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                    {brand.name}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    {brand.count} teams
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
