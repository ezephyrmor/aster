"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";

interface TeamMember {
  id: number;
  userId: number;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
    } | null;
  };
  leaveType: {
    id: number;
    name: string;
    color: string;
  };
  status: {
    id: number;
    name: string;
    color: string;
    isFinal: boolean;
  };
  reviewer: {
    username: string;
  } | null;
  reviewedAt: string | null;
}

export default function LeaveApprovalPage() {
  const { user, isLoading } = useAuth();
  const [teams, setTeams] = useState<TeamMember[][]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeamId) {
      fetchRequests();
    }
  }, [selectedTeamId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const data = await response.json();
        // Get teams where user is a leader
        const leaderTeams = data.filter((team: any) =>
          team.members.some((m: any) => m.userId === user?.id && m.isLeader),
        );
        setTeams(leaderTeams);
        if (leaderTeams.length > 0) {
          setSelectedTeamId(leaderTeams[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaves/requests?teamId=${selectedTeamId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/leaves/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusId: 2, // Approved status
          reviewedBy: user?.id,
        }),
      });

      if (response.ok) {
        setSuccess("Leave request approved successfully!");
        fetchRequests();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to approve leave request");
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
      setError("Failed to approve leave request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (requestId: number) => {
    setActionLoading(requestId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/leaves/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusId: 3, // Denied status
          reviewedBy: user?.id,
        }),
      });

      if (response.ok) {
        setSuccess("Leave request denied.");
        fetchRequests();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to deny leave request");
      }
    } catch (error) {
      console.error("Error denying leave request:", error);
      setError("Failed to deny leave request");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      yellow:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      orange:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return colors[color] || "bg-gray-100 text-gray-800";
  };

  const getFullName = (
    employeeProfile: { firstName: string; lastName: string } | null,
    username: string,
  ) => {
    if (employeeProfile) {
      return `${employeeProfile.firstName} ${employeeProfile.lastName}`;
    }
    return username;
  };

  const pendingRequests = requests.filter((r) => !r.status.isFinal);
  const processedRequests = requests.filter((r) => r.status.isFinal);

  if (isLoading || loading) {
    return (
      <DashboardLayout
        title="Approve Leaves"
        subtitle="Review team leave requests"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Approve Leaves"
      subtitle="Review and approve team leave requests"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}

      {/* Team Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Select Team
        </label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {teams.map((team: any) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            You are not a team leader. Contact your administrator to be assigned
            as a team leader.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Pending Requests ({pendingRequests.length})
            </h2>
            {pendingRequests.length === 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  No pending leave requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {getFullName(
                            request.user.employeeProfile,
                            request.user.username,
                          )}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {request.leaveType.name}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status.color)}`}
                      >
                        {request.status.name}
                      </span>
                    </div>

                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <svg
                          className="w-4 h-4"
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
                        {formatDate(request.startDate)} -{" "}
                        {formatDate(request.endDate)}
                      </div>
                    </div>

                    {request.reason && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                        {request.reason}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === request.id
                          ? "Processing..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => handleDeny(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === request.id
                          ? "Processing..."
                          : "Deny"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processed Requests */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Processed Requests ({processedRequests.length})
            </h2>
            {processedRequests.length === 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  No processed leave requests.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {processedRequests.slice(0, 10).map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {getFullName(
                            request.user.employeeProfile,
                            request.user.username,
                          )}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {request.leaveType.name}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status.color)}`}
                      >
                        {request.status.name}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(request.startDate)} -{" "}
                      {formatDate(request.endDate)}
                    </div>
                    {request.reviewedAt && (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Reviewed by {request.reviewer?.username || "Unknown"} on{" "}
                        {formatDate(request.reviewedAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
