"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

// Admin role ID
const ADMIN_ROLE_ID = 1;

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Manila");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Common timezones
  const timezones = [
    { value: "Pacific/Pago_Pago", label: "(UTC-11:00) Pago Pago" },
    { value: "Pacific/Honolulu", label: "(UTC-10:00) Honolulu" },
    { value: "America/Anchorage", label: "(UTC-09:00) Anchorage" },
    { value: "America/Los_Angeles", label: "(UTC-08:00) Los Angeles" },
    { value: "America/Denver", label: "(UTC-07:00) Denver" },
    { value: "America/Chicago", label: "(UTC-06:00) Chicago" },
    { value: "America/New_York", label: "(UTC-05:00) New York" },
    { value: "America/Sao_Paulo", label: "(UTC-03:00) São Paulo" },
    { value: "Atlantic/South_Georgia", label: "(UTC-02:00) South Georgia" },
    { value: "Atlantic/Azores", label: "(UTC-01:00) Azores" },
    { value: "Europe/London", label: "(UTC+00:00) London" },
    { value: "Europe/Paris", label: "(UTC+01:00) Paris" },
    { value: "Europe/Helsinki", label: "(UTC+02:00) Helsinki" },
    { value: "Europe/Moscow", label: "(UTC+03:00) Moscow" },
    { value: "Asia/Dubai", label: "(UTC+04:00) Dubai" },
    { value: "Asia/Karachi", label: "(UTC+05:00) Karachi" },
    { value: "Asia/Dhaka", label: "(UTC+06:00) Dhaka" },
    { value: "Asia/Bangkok", label: "(UTC+07:00) Bangkok" },
    { value: "Asia/Manila", label: "(UTC+08:00) Manila" },
    { value: "Asia/Singapore", label: "(UTC+08:00) Singapore" },
    { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo" },
    { value: "Australia/Sydney", label: "(UTC+10:00) Sydney" },
    { value: "Pacific/Noumea", label: "(UTC+11:00) Noumea" },
    { value: "Pacific/Auckland", label: "(UTC+12:00) Auckland" },
  ];

  // Check if user is admin on mount
  useEffect(() => {
    if (!isLoading && user && user.roleId !== ADMIN_ROLE_ID) {
      // Redirect non-admin users to dashboard
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timezone = e.target.value;
    setSelectedTimezone(timezone);
    localStorage.setItem("companyTimezone", timezone);
  };

  const handleSaveTimezone = async () => {
    setIsSaving(true);
    setSaveMessage("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaveMessage("Timezone updated successfully!");
    setIsSaving(false);

    setTimeout(() => setSaveMessage(""), 3000);
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout
        title="Admin Settings"
        subtitle="Company-wide settings"
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-zinc-300 border-t-blue-500 rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Redirect non-admin users
  if (!user || user.roleId !== ADMIN_ROLE_ID) {
    return null;
  }

  return (
    <DashboardLayout
      title="Admin Settings"
      subtitle="Company-wide settings"
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      }
    >
      <div className="max-w-4xl">
        {/* Attendance Timezone */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-700 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-500"
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
            Attendance Timezone
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            This timezone will be used for clock-in/clock-out times and schedule
            calculations across the entire company.
          </p>
          <div className="flex items-center gap-4">
            <select
              value={selectedTimezone}
              onChange={handleTimezoneChange}
              className="w-full md:w-auto px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveTimezone}
              disabled={isSaving}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
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
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
          {saveMessage && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">
              {saveMessage}
            </p>
          )}
        </div>

        {/* Admin Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Admin Settings
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Settings changed here will affect all users in the system.
                Please review changes carefully before saving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
