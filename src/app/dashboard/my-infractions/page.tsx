"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface MyInfraction {
  id: number;
  offenseId: number;
  typeId: number;
  date: string;
  details: string | null;
  comment: string | null;
  acknowledgedBy: number | null;
  acknowledgedAt: string | null;
  createdAt: string;
  updatedAt: string;
  offense: {
    id: number;
    name: string;
    severityLevel: number;
    type: {
      id: number;
      name: string;
      color: string;
    };
  };
  type: {
    id: number;
    name: string;
    color: string;
  };
}

export default function MyInfractionsPage() {
  const [infractions, setInfractions] = useState<MyInfraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Debounced filter
  const [debouncedStatusFilter, setDebouncedStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStatusFilter(statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter]);

  const fetchMyInfractions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedStatusFilter) params.set("status", debouncedStatusFilter);

      const response = await fetch(`/api/my-infractions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both array response and paginated response
        const infractionsArray = Array.isArray(data)
          ? data
          : data.infractions || [];
        // Normalize infractions to add missing nested objects for demo compatibility
        const normalizedInfractions = infractionsArray.map(
          (infraction: {
            id: number;
            typeId?: number;
            typeName?: string;
            description?: string;
            type?: { id: number; name: string; color: string };
            offense?: {
              id: number;
              name: string;
              severityLevel: number;
              type: { id: number; name: string; color: string };
            };
          }) => ({
            ...infraction,
            type: infraction.type || {
              id: infraction.typeId || 1,
              name: infraction.typeName || "Tardiness",
              color: "yellow",
            },
            offense: infraction.offense || {
              id: 1,
              name: infraction.description || "Minor offense",
              severityLevel: 1,
              type: {
                id: infraction.typeId || 1,
                name: infraction.typeName || "Tardiness",
                color: "yellow",
              },
            },
          }),
        );
        setInfractions(normalizedInfractions);
      } else if (response.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error fetching infractions:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedStatusFilter]);

  useEffect(() => {
    fetchMyInfractions();
  }, [fetchMyInfractions]);

  const getSeverityLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Minor";
      case 2:
        return "Major";
      case 3:
        return "Severe";
      default:
        return "Unknown";
    }
  };

  const getSeverityColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case 2:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case 3:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAckStatus = (infraction: MyInfraction) => {
    if (infraction.acknowledgedBy) {
      return {
        status: "Acknowledged",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      };
    }
    return {
      status: "Pending",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout
      title="My Infractions"
      subtitle="View your disciplinary records"
    >
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This page shows your infraction history. For questions about any
          infraction, please contact HR.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : infractions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No infractions found.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Offense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
              {infractions.map((infraction) => {
                const ackStatus = getAckStatus(infraction);
                return (
                  <tr
                    key={infraction.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(infraction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm rounded-full">
                        {infraction.type.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {infraction.offense.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${getSeverityColor(infraction.offense.severityLevel)}`}
                      >
                        {getSeverityLabel(infraction.offense.severityLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${ackStatus.color}`}
                      >
                        {ackStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/my-infractions/${infraction.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
