"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { formatCompanyDisplayName } from "@/lib/utils";
import * as Icons from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

// Admin role ID
const ADMIN_ROLE_ID = 1;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigation, setNavigation] = useState({ items: [] });
  const [isLoadingNavigation, setIsLoadingNavigation] = useState(true);
  const [renderKey, setRenderKey] = useState(0);

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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 0 01.707.293l5.414 5.414a1 0 01.293.707V19a2 2 0 01-2 2z"
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

  // Fetch navigation on mount
  useEffect(() => {
    async function fetchNavigation() {
      if (!user) return;

      try {
        const res = await fetch("/api/navigation");
        const data = await res.json();
        setNavigation(data);
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
      } finally {
        setIsLoadingNavigation(false);
      }
    }

    fetchNavigation();
  }, [user, renderKey]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700
        flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
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
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 cursor-default tooltip relative">
                {user?.companyName
                  ? formatCompanyDisplayName(user.companyName)
                  : "Admin Panel"}
                <span className="tooltip-text bg-zinc-800 text-white text-xs px-2 py-1 rounded absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible transition-all duration-200 whitespace-nowrap shadow-lg z-50">
                  {user?.companyName || "Admin Panel"}
                </span>
                <style jsx>{`
                  .tooltip:hover .tooltip-text {
                    opacity: 1;
                    visibility: visible;
                  }
                  .tooltip-text::after {
                    content: "";
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    margin-left: -4px;
                    border-width: 4px;
                    border-style: solid;
                    border-color: transparent transparent #27272a transparent;
                  }
                `}</style>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Control Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
          {/* Dynamic Navigation from Database */}
          {!isLoadingNavigation &&
            navigation.items?.map((item: NavigationItem) => {
              const IconComponent =
                (Icons[
                  item.icon as keyof typeof Icons
                ] as React.ForwardRefExoticComponent<any>) || Icons.Circle;

              if (item.type === "container" && item.children) {
                const isActive = item.children.some(
                  (child) => pathname === child.url,
                );
                const currentState =
                  localStorage.getItem(`nav_${item.name}_open`) || "false";
                const isOpen = currentState === "true";

                return (
                  <div key={item.name} className="mt-2">
                    <div
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                      onClick={() => {
                        // Set toggle state for container items
                        const currentState =
                          localStorage.getItem(`nav_${item.name}_open`) ||
                          "false";
                        localStorage.setItem(
                          `nav_${item.name}_open`,
                          currentState === "true" ? "false" : "true",
                        );
                        // Force re-render without full page reload
                        setRenderKey((prev) => prev + 1);
                      }}
                    >
                      <span
                        className={
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }
                      >
                        {typeof IconComponent === "function" && (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </span>
                      <span className="flex-1">{item.name}</span>
                      <Icons.ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${localStorage.getItem(`nav_${item.name}_open`) === "true" ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                      />
                    </div>

                    {localStorage.getItem(`nav_${item.name}_open`) ===
                      "true" && (
                      <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-1">
                        {item.children.map((child) => {
                          const ChildIconComponent =
                            (Icons[
                              child.icon as keyof typeof Icons
                            ] as React.ForwardRefExoticComponent<any>) ||
                            Icons.Circle;
                          return (
                            <div
                              key={child.name}
                              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                                pathname === child.url
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                              }`}
                              onClick={() => {
                                if (child.url) {
                                  router.push(child.url);
                                }
                              }}
                            >
                              <span
                                className={
                                  pathname === child.url
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-zinc-400 dark:text-zinc-500"
                                }
                              >
                                {typeof ChildIconComponent === "function" && (
                                  <ChildIconComponent className="w-5 h-5" />
                                )}
                              </span>
                              <span className="flex-1">{child.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Page item
              const IconComponentFinal =
                (Icons[
                  item.icon as keyof typeof Icons
                ] as React.ForwardRefExoticComponent<any>) || Icons.Circle;

              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                    pathname === item.url
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  onClick={() => {
                    if (item.url) {
                      router.push(item.url);
                    }
                  }}
                >
                  <span
                    className={
                      pathname === item.url
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-500 dark:text-zinc-400"
                    }
                  >
                    {typeof IconComponentFinal === "function" && (
                      <IconComponentFinal className="w-5 h-5" />
                    )}
                  </span>
                  <span className="flex-1">{item.name}</span>
                </div>
              );
            })}

          {/* Access & Navigation Section */}
          <div key="access-navigation" className="mt-2">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                [
                  "/dashboard/feature-manager",
                  "/dashboard/feature-manager/features",
                  "/dashboard/feature-manager/navigation-builder",
                  "/dashboard/feature-manager/role-mapping",
                ].includes(pathname)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              onClick={() => {
                const currentState =
                  localStorage.getItem(`nav_access_navigation_open`) || "false";
                localStorage.setItem(
                  `nav_access_navigation_open`,
                  currentState === "true" ? "false" : "true",
                );
                setRenderKey((prev) => prev + 1);
              }}
            >
              <span
                className={
                  [
                    "/dashboard/feature-manager",
                    "/dashboard/feature-manager/features",
                    "/dashboard/feature-manager/navigation-builder",
                    "/dashboard/feature-manager/role-mapping",
                  ].includes(pathname)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }
              >
                <Icons.Settings className="w-5 h-5" />
              </span>
              <span className="flex-1">Access & Navigation</span>
              <Icons.ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${localStorage.getItem(`nav_access_navigation_open`) === "true" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
              />
            </div>

            {localStorage.getItem(`nav_access_navigation_open`) === "true" && (
              <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-1">
                {/* Features */}
                <div
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                    pathname === "/dashboard/feature-manager" ||
                    pathname === "/dashboard/feature-manager/features"
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  onClick={() => {
                    router.push("/dashboard/feature-manager");
                  }}
                >
                  <span
                    className={
                      pathname === "/dashboard/feature-manager" ||
                      pathname === "/dashboard/feature-manager/features"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }
                  >
                    <Icons.List className="w-5 h-5" />
                  </span>
                  <span className="flex-1">Features</span>
                </div>

                {/* Navigation Builder */}
                <div
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                    pathname === "/dashboard/feature-manager/navigation-builder"
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  onClick={() => {
                    router.push(
                      "/dashboard/feature-manager/navigation-builder",
                    );
                  }}
                >
                  <span
                    className={
                      pathname ===
                      "/dashboard/feature-manager/navigation-builder"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }
                  >
                    <Icons.Map className="w-5 h-5" />
                  </span>
                  <span className="flex-1">Navigation Builder</span>
                </div>

                {/* Role Mapping */}
                <div
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                    pathname === "/dashboard/feature-manager/role-mapping"
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  onClick={() => {
                    router.push("/dashboard/feature-manager/role-mapping");
                  }}
                >
                  <span
                    className={
                      pathname === "/dashboard/feature-manager/role-mapping"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }
                  >
                    <Icons.Key className="w-5 h-5" />
                  </span>
                  <span className="flex-1">Role Mapping</span>
                </div>
              </div>
            )}
          </div>

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
          {String(user?.roleId) === String(ADMIN_ROLE_ID) && (
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
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
}
