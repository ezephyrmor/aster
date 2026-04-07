"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import { useLeaveColumns, LeaveRequest } from "@/components/LeaveColumns";
import { PaginationState, SortingState } from "@tanstack/react-table";

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

  // TanStack Table pagination state
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // TanStack Table sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Sync TanStack Table pagination with our pagination state
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: tablePagination.pageIndex + 1,
      limit: tablePagination.pageSize,
    }));
  }, [tablePagination]);

  // Sync TanStack Table sorting with our sorting state
  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0];
      setSortBy(sort.id);
      setSortOrder(sort.desc ? "desc" : "asc");
    }
  }, [sorting]);

  // Modal states
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
    setTablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, leaveTypeFilter, statusFilter, paidFilter]);

  // Update sorting state when TanStack Table sorting changes
  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((old) => {
        const newSorting =
          typeof updater === "function" ? updater(old) : updater;
        return newSorting;
      });
    },
    [],
  );

  // Modal handlers
  const openActionModal = useCallback(
    (request: LeaveRequest, action: "approve" | "deny") => {
      setSelectedRequest(request);
      setPendingAction(action);
      setCommentText("");
      setShowCommentModal(true);
    },
    [],
  );

  const closeActionModal = useCallback(() => {
    setShowCommentModal(false);
    setSelectedRequest(null);
    setPendingAction(null);
    setCommentText("");
  }, []);

  const openDetailsModal = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  }, []);

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

  // Helper functions
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

  // Get columns with action handlers
  const columns = useLeaveColumns({
    onAction: openActionModal,
    onViewDetails: openDetailsModal,
  });

  // Build filters configuration
  const filters: FilterConfig[] = [
    {
      id: "leaveType",
      label: "Leave Type",
      type: "select",
      options: [
        { value: "sick_leave", label: "Sick Leave" },
        { value: "vacation_leave", label: "Vacation Leave" },
        { value: "emergency_leave", label: "Emergency Leave" },
        { value: "maternity_leave", label: "Maternity Leave" },
        { value: "paternity_leave", label: "Paternity Leave" },
      ],
      value: leaveTypeFilter,
      onChange: setLeaveTypeFilter,
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "denied", label: "Denied" },
        { value: "cancelled", label: "Cancelled" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      id: "isPaid",
      label: "Payment Type",
      type: "select",
      options: [
        { value: "true", label: "Paid" },
        { value: "false", label: "Unpaid" },
      ],
      value: paidFilter,
      onChange: setPaidFilter,
    },
  ];

  return (
    <div className="space-y-4">
      <ServerSideDataTable
        columns={columns}
        data={requests}
        totalCount={pagination.total}
        isLoading={loading}
        error={error}
        searchKey="name"
        searchPlaceholder="Search by employee name..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        pagination={tablePagination}
        onPaginationChange={setTablePagination}
        sorting={sorting}
        onSortingChange={handleSortingChange}
      />

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
