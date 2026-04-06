"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";

interface LeaveRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  isPaid: boolean;
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
  reviewComment: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LeaveListResponse {
  requests: LeaveRequest[];
  pagination: Pagination;
}

export default function LeaveList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Filter states
  const [search, setSearch] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paidFilter, setPaidFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Comment modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [commentText, setCommentText] = useState("");
  const [pendingAction, setPendingAction] = useState<"approve" | "deny" | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (leaveTypeFilter) params.set("leaveType", leaveTypeFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (paidFilter) params.set("isPaid", paidFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const response = await fetch(`/api/leaves/requests?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      const data: LeaveListResponse = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    leaveTypeFilter,
    statusFilter,
    paidFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, leaveTypeFilter, statusFilter, paidFilter]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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

  const openActionModal = (
    request: LeaveRequest,
    action: "approve" | "deny",
  ) => {
    setSelectedRequest(request);
    setPendingAction(action);
    setCommentText("");
    setShowCommentModal(true);
  };

  const closeActionModal = () => {
    setShowCommentModal(false);
    setSelectedRequest(null);
    setPendingAction(null);
    setCommentText("");
  };

  const openDetailsModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !pendingAction) return;

    setActionLoading(true);
    closeActionModal();

    try {
      const response = await fetch(
        `/api/leaves/requests/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            statusId: pendingAction === "approve" ? 2 : 3,
            reviewedBy: user?.id,
            reviewComment: commentText || null,
          }),
        },
      );

      if (response.ok) {
        fetchRequests();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to process leave request");
      }
    } catch (error) {
      console.error("Error processing leave request:", error);
      alert("Failed to process leave request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>

          {/* Leave Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leave Type
            </label>
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">All Types</option>
              <option value="sick_leave">Sick Leave</option>
              <option value="vacation_leave">Vacation Leave</option>
              <option value="emergency_leave">Emergency Leave</option>
              <option value="maternity_leave">Maternity Leave</option>
              <option value="paternity_leave">Paternity Leave</option>
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Paid/Unpaid Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Type
            </label>
            <select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">All</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("user.employeeProfile.firstName")}
                >
                  <div className="flex items-center gap-1">
                    Employee {getSortIcon("user.employeeProfile.firstName")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("leaveType.name")}
                >
                  <div className="flex items-center gap-1">
                    Leave Type {getSortIcon("leaveType.name")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("startDate")}
                >
                  <div className="flex items-center gap-1">
                    Start Date {getSortIcon("startDate")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("endDate")}
                >
                  <div className="flex items-center gap-1">
                    End Date {getSortIcon("endDate")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Days
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("isPaid")}
                >
                  <div className="flex items-center gap-1">
                    Type {getSortIcon("isPaid")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("status.name")}
                >
                  <div className="flex items-center gap-1">
                    Status {getSortIcon("status.name")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No leave requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getFullName(
                          request.user.employeeProfile,
                          request.user.username,
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.leaveType.color)}`}
                      >
                        {request.leaveType.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(request.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(request.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {calculateDays(request.startDate, request.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.isPaid
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {request.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status.color)}`}
                      >
                        {request.status.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailsModal(request)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                        {!request.status.isFinal && (
                          <>
                            <button
                              onClick={() =>
                                openActionModal(request, "approve")
                              }
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(request, "deny")}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Previous
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          pagination.page === pageNum
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Leave Request Details
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Employee Info */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Employee
                </p>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {getFullName(
                    selectedRequest.user.employeeProfile,
                    selectedRequest.user.username,
                  )}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {selectedRequest.user.username}
                </p>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Leave Type
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.leaveType.color)}`}
                  >
                    {selectedRequest.leaveType.name}
                  </span>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status.color)}`}
                  >
                    {selectedRequest.status.name}
                  </span>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Start Date
                  </p>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {formatDate(selectedRequest.startDate)}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    End Date
                  </p>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {formatDate(selectedRequest.endDate)}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {calculateDays(
                      selectedRequest.startDate,
                      selectedRequest.endDate,
                    )}{" "}
                    day(s)
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Payment Type
                  </p>
                  <p
                    className={`text-base font-medium ${selectedRequest.isPaid ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
                  >
                    {selectedRequest.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>
              </div>

              {/* Reason */}
              {selectedRequest.reason && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Reason
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              {/* Review Info */}
              {selectedRequest.status.isFinal && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Review Information
                  </p>
                  {selectedRequest.reviewer && (
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      Reviewed by:{" "}
                      <span className="font-medium">
                        {selectedRequest.reviewer.username || "Unknown"}
                      </span>
                    </p>
                  )}
                  {selectedRequest.reviewedAt && (
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      Reviewed on:{" "}
                      <span className="font-medium">
                        {formatDate(selectedRequest.reviewedAt)}
                      </span>
                    </p>
                  )}
                  {selectedRequest.reviewComment && (
                    <div className="mt-2 p-3 bg-white dark:bg-zinc-600 rounded-lg">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                        Comment
                      </p>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {selectedRequest.reviewComment}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {pendingAction === "approve" ? "Approve" : "Deny"} Leave Request
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              {pendingAction === "approve"
                ? "Add an optional comment for this approval:"
                : "Please provide a reason for denying this request:"}
            </p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Enter your comment..."
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={
                  pendingAction === "approve"
                    ? "flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    : "flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                }
              >
                {actionLoading
                  ? "Processing..."
                  : pendingAction === "approve"
                    ? "Approve"
                    : "Deny"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
