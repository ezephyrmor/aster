"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface Infraction {
  id: number;
  userId: number;
  offenseId: number;
  typeId: number;
  date: string;
  details: string | null;
  comment: string | null;
  acknowledgedBy: number | null;
  acknowledgedAt: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
      department: { name: string } | null;
      position: { name: string } | null;
    } | null;
  };
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
  ackUser: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

interface InfractionType {
  id: number;
  name: string;
  color: string;
}

interface InfractionOffense {
  id: number;
  name: string;
  severityLevel: number;
  typeId: number;
}

export default function InfractionsPage() {
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<InfractionType[]>([]);
  const [offenses, setOffenses] = useState<InfractionOffense[]>([]);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [acknowledgedFilter, setAcknowledgedFilter] = useState("");

  // Acknowledge modal state
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgingInfractionId, setAcknowledgingInfractionId] = useState<
    number | null
  >(null);
  const [acknowledgeComment, setAcknowledgeComment] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchName]);

  const fetchInfractions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("typeId", typeFilter);
      if (acknowledgedFilter) params.set("acknowledged", acknowledgedFilter);

      const response = await fetch(`/api/infractions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInfractions(data);
      }
    } catch (error) {
      console.error("Error fetching infractions:", error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, acknowledgedFilter]);

  const fetchLookups = useCallback(async () => {
    try {
      const [typesRes, offensesRes] = await Promise.all([
        fetch("/api/infraction-types"),
        fetch("/api/infraction-offenses"),
      ]);

      if (typesRes.ok) {
        const data = await typesRes.json();
        setTypes(data);
      }

      if (offensesRes.ok) {
        const data = await offensesRes.json();
        setOffenses(data);
      }
    } catch (error) {
      console.error("Error fetching lookups:", error);
    }
  }, []);

  useEffect(() => {
    fetchInfractions();
    fetchLookups();
  }, [fetchInfractions, fetchLookups]);

  // Apply name filter client-side
  const filteredInfractions = infractions.filter((infraction) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    const fullName =
      `${infraction.user.employeeProfile?.firstName || ""} ${infraction.user.employeeProfile?.lastName || ""} ${infraction.user.username}`.toLowerCase();
    return fullName.includes(searchLower);
  });

  const getFullName = (infraction: Infraction) => {
    if (infraction.user.employeeProfile) {
      return `${infraction.user.employeeProfile.firstName} ${infraction.user.employeeProfile.lastName}`;
    }
    return infraction.user.username;
  };

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

  const getAckStatus = (infraction: Infraction) => {
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

  const openAcknowledgeModal = (id: number) => {
    setAcknowledgingInfractionId(id);
    setAcknowledgeComment("");
    setShowAcknowledgeModal(true);
  };

  const closeAcknowledgeModal = () => {
    setShowAcknowledgeModal(false);
    setAcknowledgingInfractionId(null);
    setAcknowledgeComment("");
  };

  const handleAcknowledge = async () => {
    if (!acknowledgeComment.trim()) {
      alert("Please provide a comment before acknowledging.");
      return;
    }

    if (!acknowledgingInfractionId) return;

    try {
      const response = await fetch(
        `/api/infractions/${acknowledgingInfractionId}/acknowledge`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            acknowledgedBy: 1, // Admin user ID
            comment: acknowledgeComment,
          }),
        },
      );

      if (response.ok) {
        // Update the local state
        setInfractions(
          infractions.map((infraction) =>
            infraction.id === acknowledgingInfractionId
              ? {
                  ...infraction,
                  acknowledgedBy: 1,
                  acknowledgedAt: new Date().toISOString(),
                  comment: acknowledgeComment,
                }
              : infraction,
          ),
        );
        closeAcknowledgeModal();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to acknowledge infraction");
      }
    } catch (error) {
      console.error("Error acknowledging infraction:", error);
      alert("Failed to acknowledge infraction");
    }
  };

  return (
    <DashboardLayout
      title="Employee Infractions"
      subtitle="Track and manage employee disciplinary actions"
    >
      {/* Header with Add button */}
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Record and track employee infractions, violations, and disciplinary
            actions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/infractions/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            + Add Infraction
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by employee name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Infraction Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type.id} value={type.id.toString()}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Acknowledgment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={acknowledgedFilter}
              onChange={(e) => setAcknowledgedFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">All Statuses</option>
              <option value="false">Pending</option>
              <option value="true">Acknowledged</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredInfractions.length === 0 ? (
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
                  Employee
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
                  Date
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
              {filteredInfractions.map((infraction) => {
                const ackStatus = getAckStatus(infraction);
                return (
                  <tr
                    key={infraction.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getFullName(infraction)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {infraction.user.username}
                      </div>
                      {infraction.user.employeeProfile?.department && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {infraction.user.employeeProfile.department.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-sm rounded-full"
                        style={{
                          backgroundColor: `var(--tw-${infraction.type.color}-100)`,
                          color: `var(--tw-${infraction.type.color}-800)`,
                        }}
                      >
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
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(infraction.date)}
                      </div>
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
                        href={`/dashboard/infractions/${infraction.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        View
                      </Link>
                      {!infraction.acknowledgedBy && (
                        <button
                          onClick={() => openAcknowledgeModal(infraction.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          Acknowledge
                        </button>
                      )}
                      <Link
                        href={`/dashboard/infractions/${infraction.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Acknowledge Modal */}
      {showAcknowledgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Acknowledge Infraction
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a comment before acknowledging this infraction.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={acknowledgeComment}
                onChange={(e) => setAcknowledgeComment(e.target.value)}
                rows={4}
                placeholder="Enter your acknowledgment comment..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeAcknowledgeModal}
                className="flex-1 py-2 px-4 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcknowledge}
                disabled={!acknowledgeComment.trim()}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
