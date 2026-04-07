"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";

interface LeaveType {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

interface LeaveStatus {
  id: number;
  name: string;
  color: string;
}

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  leaveType: LeaveType;
  status: LeaveStatus;
  createdAt: string;
}

interface LeaveCredit {
  totalCredits: number;
  availableCredits: number;
  usedCredits: number;
  creditsByMonth: Array<{
    period: string;
    total: number;
    used: number;
    available: number;
    earnedDate: string;
  }>;
}

export default function LeaveRequestPage() {
  const { user, isLoading } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [credits, setCredits] = useState<LeaveCredit | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      fetchLeaveTypes();
      fetchMyRequests();
      fetchCredits();
    }
  }, [user]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("/api/leaves/types");
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data);
        if (data.length > 0) {
          setLeaveTypeId(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`/api/leaves/requests?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both old array format and new paginated format
        // Demo API returns leaveRequests, regular API returns requests
        const requests = Array.isArray(data)
          ? data
          : data.leaveRequests || data.requests || [];
        setMyRequests(requests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch(`/api/leaves/credits?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      }
    } catch (error) {
      console.error("Error fetching leave credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!leaveTypeId || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/leaves/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          leaveTypeId: parseInt(leaveTypeId),
          startDate,
          endDate,
          reason,
          isPaid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Leave request submitted successfully!");
        // Reset form
        setLeaveTypeId(
          leaveTypes.length > 0 ? leaveTypes[0].id.toString() : "",
        );
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchMyRequests();
        fetchCredits();
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setError("Failed to submit leave request");
    } finally {
      setSubmitting(false);
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

  if (isLoading || loading) {
    return (
      <DashboardLayout title="Leave Request" subtitle="Request time off">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Leave Request"
      subtitle="Request time off from work"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
              Submit a Leave Request
            </h2>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Provide a reason for your leave request..."
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Payment Type
                </label>
                <select
                  value={isPaid ? "paid" : "unpaid"}
                  onChange={(e) => setIsPaid(e.target.value === "paid")}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="paid">Paid (uses leave credits)</option>
                  <option value="unpaid">Unpaid (no credits used)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Leave Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Leave Credits & History */}
        <div className="space-y-6">
          {/* Credits Summary */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Leave Credits
            </h3>
            {credits && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Available
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {credits.availableCredits}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Total Earned
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {credits.totalCredits}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Used
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {credits.usedCredits}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Recent Requests
            </h3>
            {myRequests.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No leave requests yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {request.leaveType.name}
                      </span>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
