"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import {
  useInfractionColumns,
  Infraction,
  InfractionAction,
} from "@/components/InfractionColumns";
import { PaginationState, SortingState } from "@tanstack/react-table";
import Link from "next/link";

interface InfractionType {
  id: number;
  name: string;
  color: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InfractionsResponse {
  infractions: Infraction[];
  pagination: Pagination;
}

export default function InfractionsPage() {
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<InfractionType[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // TanStack Table pagination state
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // TanStack Table sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [acknowledgedFilter, setAcknowledgedFilter] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchName]);

  // Sync TanStack Table pagination with our pagination state
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: tablePagination.pageIndex + 1,
      limit: tablePagination.pageSize,
    }));
  }, [tablePagination]);

  // Map sorting column IDs to API field names
  // Note: Prisma orderBy doesn't support deeply nested relations like user.employeeProfile.firstName
  // We use simpler fields that Prisma can handle
  const getSortByField = (columnId: string): string => {
    const fieldMap: Record<string, string> = {
      user: "userId", // Sort by user ID since nested name sorting isn't supported
      severity: "offenseId", // Sort by offense ID (severity column uses this)
      date: "date",
      status: "acknowledgedBy",
      type: "typeId",
      offense: "offenseId",
    };
    return fieldMap[columnId] || columnId;
  };

  // Acknowledge modal state
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgingInfractionId, setAcknowledgingInfractionId] = useState<
    number | null
  >(null);
  const [acknowledgeComment, setAcknowledgeComment] = useState("");

  const fetchInfractions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (typeFilter) params.set("typeId", typeFilter);
      if (acknowledgedFilter) params.set("acknowledged", acknowledgedFilter);

      // Add sorting parameters
      if (sorting.length > 0) {
        const sort = sorting[0];
        const sortBy = getSortByField(sort.id);
        const sortOrder = sort.desc ? "desc" : "asc";
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
      }

      const response = await fetch(`/api/infractions?${params.toString()}`);
      if (response.ok) {
        const data: InfractionsResponse = await response.json();
        setInfractions(data.infractions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching infractions:", error);
      setError("Failed to fetch infractions");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    typeFilter,
    acknowledgedFilter,
    sorting,
  ]);

  const fetchLookups = useCallback(async () => {
    try {
      const typesRes = await fetch("/api/infraction-types");
      if (typesRes.ok) {
        const data = await typesRes.json();
        setTypes(data);
      }
    } catch (error) {
      console.error("Error fetching lookups:", error);
    }
  }, []);

  useEffect(() => {
    fetchInfractions();
  }, [fetchInfractions]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setTablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, typeFilter, acknowledgedFilter]);

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
        fetchInfractions();
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

  // Handle infraction actions from the table
  const handleInfractionAction = useCallback((action: InfractionAction) => {
    switch (action.type) {
      case "view":
        // Navigate to view page
        window.location.href = `/dashboard/infractions/${action.infraction.id}`;
        break;
      case "acknowledge":
        openAcknowledgeModal(action.infraction.id);
        break;
      case "edit":
        // Navigate to edit page
        window.location.href = `/dashboard/infractions/${action.infraction.id}/edit`;
        break;
    }
  }, []);

  // Get columns with action handlers
  const columns = useInfractionColumns({ onAction: handleInfractionAction });

  // Build filters configuration
  const filters: FilterConfig[] = [
    {
      id: "type",
      label: "Infraction Type",
      type: "select",
      options: types.map((type) => ({
        value: type.id.toString(),
        label: type.name,
      })),
      value: typeFilter,
      onChange: setTypeFilter,
    },
    {
      id: "acknowledged",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All Statuses" },
        { value: "false", label: "Pending" },
        { value: "true", label: "Acknowledged" },
      ],
      value: acknowledgedFilter,
      onChange: setAcknowledgedFilter,
    },
  ];

  // Create the Add Infraction button
  const searchAction = (
    <Link
      href="/dashboard/infractions/new"
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
    >
      + Add Infraction
    </Link>
  );

  return (
    <DashboardLayout
      title="Employee Infractions"
      subtitle="Track and manage employee disciplinary actions"
    >
      <ServerSideDataTable
        columns={columns}
        data={infractions}
        totalCount={pagination.total}
        isLoading={loading}
        error={error}
        searchKey="name"
        searchPlaceholder="Search by employee name..."
        searchValue={searchName}
        onSearchChange={setSearchName}
        searchAction={searchAction}
        filters={filters}
        pagination={tablePagination}
        onPaginationChange={setTablePagination}
        sorting={sorting}
        onSortingChange={handleSortingChange}
      />

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
