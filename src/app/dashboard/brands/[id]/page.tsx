"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface UserOption {
  id: number;
  username: string;
  employeeProfile: {
    firstName: string;
    lastName: string;
  } | null;
}

interface Team {
  id: number;
  name: string;
  description?: string | null;
  _count: {
    members: number;
  };
}

interface EmployeeProfile {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string | null;
}

interface Manager {
  id: number;
  username: string;
  employeeProfile: EmployeeProfile | null;
}

interface Industry {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  industry?: Industry | null;
  status: string;
  manager?: Manager | null;
  teams: Team[];
  _count: {
    teams: number;
  };
}

interface ManagerHistoryRecord {
  id: number;
  brandId: number;
  action: "ASSIGNED" | "REMOVED";
  timestamp: string;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  manager: {
    id: number;
    username: string;
    name: string | null;
  } | null;
  performedBy: {
    id: number;
    username: string;
    name: string | null;
  };
  previousManager: { id: number } | null;
}

interface ManagerHistoryResponse {
  history: ManagerHistoryRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [assigningManager, setAssigningManager] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [managerHistory, setManagerHistory] = useState<ManagerHistoryRecord[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");

  // Fetch brand and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brand details
        const brandResponse = await fetch(`/api/brands/${resolvedParams.id}`);
        if (!brandResponse.ok) {
          throw new Error("Failed to fetch brand");
        }
        const brandData = await brandResponse.json();
        setBrand(brandData);
        if (brandData.manager) {
          setSelectedManagerId(brandData.manager.id.toString());
        }

        // Fetch users for manager selection
        const usersResponse = await fetch("/api/users?limit=100");
        if (usersResponse.ok) {
          const data = await usersResponse.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this brand? This action cannot be undone.",
      )
    )
      return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/brands/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete brand");
      }

      router.push("/dashboard/brands");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedManagerId) return;

    setAssigningManager(true);
    try {
      // TODO: Get actual logged-in user ID from auth context
      const performedBy = 1; // Placeholder - replace with actual user ID

      const response = await fetch(`/api/brands/${resolvedParams.id}/manager`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: parseInt(selectedManagerId),
          performedBy,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to assign manager");
      }

      const updatedBrand = await response.json();
      setBrand(updatedBrand);
      setShowManagerDropdown(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAssigningManager(false);
    }
  };

  const handleRemoveManager = () => {
    setRemoveReason("");
    setShowRemoveModal(true);
  };

  const confirmRemoveManager = async () => {
    setShowRemoveModal(false);
    setAssigningManager(true);
    try {
      // TODO: Get actual logged-in user ID from auth context
      const performedBy = 1; // Placeholder - replace with actual user ID

      const response = await fetch(`/api/brands/${resolvedParams.id}/manager`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performedBy,
          reason: removeReason || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to remove manager");
      }

      const updatedBrand = await response.json();
      setBrand(updatedBrand);
      setSelectedManagerId("");
      setRemoveReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAssigningManager(false);
    }
  };

  const cancelRemoveManager = () => {
    setShowRemoveModal(false);
    setRemoveReason("");
  };

  const getUserName = (user: UserOption | Manager) => {
    if (user.employeeProfile) {
      return `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`;
    }
    return user.username;
  };

  // Fetch manager history
  const fetchManagerHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(
        `/api/brands/${resolvedParams.id}/manager/history?limit=10`,
      );
      if (response.ok) {
        const data: ManagerHistoryResponse = await response.json();
        setManagerHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch manager history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Refresh history when manager changes
  useEffect(() => {
    if (brand && showHistory) {
      fetchManagerHistory();
    }
  }, [brand, showHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadgeColor = (action: string) => {
    return action === "ASSIGNED"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Brand Details"
        subtitle="Loading..."
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !brand) {
    return (
      <DashboardLayout
        title="Brand Details"
        subtitle="Error"
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
        <div className="text-center py-12">
          <p className="text-red-600">{error || "Brand not found"}</p>
          <button
            onClick={() => router.push("/dashboard/brands")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Back to Brands
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout
      title={brand.name}
      subtitle="Brand details and teams"
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      }
    >
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Brand Info & Teams */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Info Card */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Brand Information
              </h2>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/brands/${brand.id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting || (brand._count?.teams ?? 0) > 0}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {brand.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(brand.status)}`}
                    >
                      {brand.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Industry
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {brand.industry?.name || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Website
                  </label>
                  <p className="mt-1">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                      >
                        {brand.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Not specified
                      </span>
                    )}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {brand.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Card */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Teams ({brand._count?.teams ?? 0})
              </h2>
              <Link
                href="/dashboard/teams/create"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add Team
              </Link>
            </div>

            {(brand.teams?.length ?? 0) === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No teams assigned to this brand yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                {(brand.teams || []).map((team) => (
                  <li
                    key={team.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  >
                    <Link
                      href={`/dashboard/teams/${team.id}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {team.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {team._count.members} members
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Teams
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {brand._count?.teams ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(brand.status)}`}
                >
                  {brand.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Industry
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {brand.industry?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Brand Manager */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Brand Manager
            </h3>
            {brand.manager ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {brand.manager.employeeProfile
                        ? brand.manager.employeeProfile.firstName.charAt(0)
                        : brand.manager.username.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {getUserName(brand.manager)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{brand.manager.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveManager}
                  disabled={assigningManager}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningManager ? "Removing..." : "Remove Manager"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No manager assigned yet.
                </p>
                <div className="relative">
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-zinc-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 py-2 px-3"
                  >
                    <option value="">Select a manager...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getUserName(user)} (@{user.username})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignManager}
                  disabled={assigningManager || !selectedManagerId}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningManager ? "Assigning..." : "Assign Manager"}
                </button>
              </div>
            )}
          </div>

          {/* Manager History / Audit Log */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Manager History
              </h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                {showHistory ? "Hide" : "Show"}
              </button>
            </div>
            {showHistory ? (
              historyLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              ) : managerHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No manager history yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {managerHistory.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionBadgeColor(record.action)}`}
                            >
                              {record.action}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(record.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {record.action === "ASSIGNED"
                              ? `${record.manager?.name || "User #" + record.manager?.id || "Unknown"} assigned as manager`
                              : `${record.manager?.name || "User #" + record.manager?.id || "Unknown"} removed as manager`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By:{" "}
                            {record.performedBy.name ||
                              record.performedBy.username}
                          </p>
                          {record.reason && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Reason: {record.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click "Show" to view manager change history.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Remove Manager Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={cancelRemoveManager}
          />

          {/* Modal centered */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Remove Brand Manager
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Please provide a reason for removing the manager from this
                  brand.
                </p>
              </div>

              {/* Reason textarea */}
              <div className="mb-6">
                <label
                  htmlFor="remove-reason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Reason for removal
                </label>
                <textarea
                  id="remove-reason"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 px-3 py-2"
                  placeholder="Enter the reason for removing this manager..."
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelRemoveManager}
                  disabled={assigningManager}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveManager}
                  disabled={assigningManager}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningManager ? "Removing..." : "Remove Manager"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
