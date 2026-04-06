"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Admin role ID
const ADMIN_ROLE_ID = 1;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if any href in a group is active
  const isGroupActive = (hrefs: string[]) => {
    return hrefs.some((href) => pathname === href);
  };

  // Group toggle states
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  // Personal group items with hrefs for active state checking
  const personalItemsHrefs = [
    "/dashboard/leaves/request",
    "/dashboard/my-infractions",
  ];

  // Manage group items with hrefs for active state checking
  const manageItemsHrefs = [
    "/dashboard/users",
    "/dashboard/brands",
    "/dashboard/teams",
    "/dashboard/calendar",
    "/dashboard/leaves/approve",
    "/dashboard/schedules",
    "/dashboard/infractions",
    "/dashboard/datatable-demo",
  ];

  // Auto-expand groups when a child item is active
  const shouldPersonalBeOpen =
    isPersonalOpen || isGroupActive(personalItemsHrefs);
  const shouldManageBeOpen = isManageOpen || isGroupActive(manageItemsHrefs);

  // Personal group items with icons
  const personalItems = [
    {
      name: "Request Leave",
      href: "/dashboard/leaves/request",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "My Infractions",
      href: "/dashboard/my-infractions",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  // Manage group items
  const manageItems = [
    {
      name: "Users",
      href: "/dashboard/users",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      name: "Brands",
      href: "/dashboard/brands",
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      name: "Teams",
      href: "/dashboard/teams",
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Calendar",
      href: "/dashboard/calendar",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Leave",
      href: "/dashboard/leaves/approve",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      name: "Schedules",
      href: "/dashboard/schedules",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Infractions",
      href: "/dashboard/infractions",
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      name: "DataTable Demo",
      href: "/dashboard/datatable-demo",
      icon: (
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
            d="M3 10h18M3 14h18M3 10h18M3 14h18"
          />
        </svg>
      ),
    },
  ];

  // Top-level navigation items (Dashboard, Analytics, Settings)
  const topLevelItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
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
            d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
          />
        </svg>
      ),
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Coming Soon navigation items
  const comingSoonItems = [
    {
      name: "Coachings",
      href: null,
      comingSoon: true,
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m-7.5 3.5a5 5 0 014-8h1a5 5 0 015 5v1m-6-3v6m0 0l-3-3m3 3l3-3"
          />
        </svg>
      ),
    },
    {
      name: "Reports",
      href: null,
      comingSoon: true,
      icon: (
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "Payroll",
      href: null,
      comingSoon: true,
      icon: (
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
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Handbook",
      href: null,
      comingSoon: true,
      icon: (
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
      >
        <svg
          className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700
        flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Admin Panel
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Control Center
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg
              className="w-5 h-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          {topLevelItems
            .filter((item) => item.name === "Dashboard")
            .map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                  pathname === item.href
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                  }
                }}
              >
                <span
                  className={
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
              </div>
            ))}

          {/* Personal collapsible group */}
          <div className="mt-2">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                isGroupActive(personalItemsHrefs)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              onClick={() => setIsPersonalOpen(!isPersonalOpen)}
            >
              <span
                className={
                  isGroupActive(personalItemsHrefs)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <span className="flex-1">Personal</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  shouldPersonalBeOpen ? "rotate-180" : ""
                } ${isGroupActive(personalItemsHrefs) ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`}
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
            </div>

            {/* Personal sub-items */}
            {shouldPersonalBeOpen && (
              <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-1">
                {personalItems.map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                  >
                    <span
                      className={
                        pathname === item.href
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manage collapsible group */}
          <div className="mt-2">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                isGroupActive(manageItemsHrefs)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              onClick={() => setIsManageOpen(!isManageOpen)}
            >
              <span
                className={
                  isGroupActive(manageItemsHrefs)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </span>
              <span className="flex-1">Manage</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  shouldManageBeOpen ? "rotate-180" : ""
                } ${isGroupActive(manageItemsHrefs) ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`}
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
            </div>

            {/* Manage sub-items */}
            {shouldManageBeOpen && (
              <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-1">
                {manageItems.map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                  >
                    <span
                      className={
                        pathname === item.href
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics and Settings */}
          {topLevelItems
            .filter((item) => item.name !== "Dashboard")
            .map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                  pathname === item.href
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                  }
                }}
              >
                <span
                  className={
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
              </div>
            ))}

          {/* Coming Soon items */}
          <div className="mt-2">
            {comingSoonItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 rounded-lg cursor-not-allowed"
              >
                <span className="text-zinc-400 dark:text-zinc-500">
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                  Soon
                </span>
              </div>
            ))}
          </div>

          {/* Admin-only navigation items */}
          {user?.roleId === ADMIN_ROLE_ID && (
            <div
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
              onClick={() => {
                router.push("/dashboard/admin/settings");
              }}
            >
              <span className="text-zinc-500 dark:text-zinc-400">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <span className="flex-1">Admin Settings</span>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                Admin User
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                admin@company.com
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Logout"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          {isLoggingOut && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
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
              Logging out...
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
