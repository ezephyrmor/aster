"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import { columns, Brand } from "@/components/BrandColumns";
import { PaginationState, SortingState } from "@tanstack/react-table";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BrandListResponse {
  brands: Brand[];
  pagination: Pagination;
  industries: string[];
}

interface BrandListProps {
  /** Optional callback when Create Brand button is clicked */
  onAddClick?: () => void;
}

export default function BrandList({ onAddClick }: BrandListProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [industries, setIndustries] = useState<string[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
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

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (industryFilter) params.set("industry", industryFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const response = await fetch(`/api/brands?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data: BrandListResponse = await response.json();
      setBrands(data.brands);
      setPagination(data.pagination);
      setIndustries(data.industries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    statusFilter,
    industryFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setTablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, statusFilter, industryFilter]);

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

  // Build filters configuration
  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "archived", label: "Archived" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      id: "industry",
      label: "Industry",
      type: "select",
      options: industries.map((ind) => ({ value: ind, label: ind })),
      value: industryFilter,
      onChange: setIndustryFilter,
    },
  ];

  // Create the Create Brand button if onAddClick is provided
  const searchAction = onAddClick ? (
    <button
      onClick={onAddClick}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap"
    >
      <svg
        className="-ml-1 mr-2 h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      Create Brand
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={brands}
      totalCount={pagination.total}
      isLoading={loading}
      error={error}
      searchKey="name"
      searchPlaceholder="Search by brand name..."
      searchValue={search}
      onSearchChange={setSearch}
      searchAction={searchAction}
      filters={filters}
      pagination={tablePagination}
      onPaginationChange={setTablePagination}
      sorting={sorting}
      onSortingChange={handleSortingChange}
    />
  );
}
