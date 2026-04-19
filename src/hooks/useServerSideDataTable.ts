"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseServerSideDataTableOptions<T> {
  apiEndpoint: string;
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
  extraParams?: Record<string, string>;
  onDataFetched?: (data: any) => void;
  mapResponse?: (response: any) => {
    items: T[];
    pagination: Pagination;
    [key: string]: any;
  };
}

interface UseServerSideDataTableResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  tablePagination: PaginationState;
  setTablePagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  refresh: () => Promise<void>;
  extraParams: Record<string, string>;
  setExtraParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

/**
 * Generic hook for server-side data table functionality
 * Eliminates ~150+ lines of boilerplate code per list component
 */
export function useServerSideDataTable<T>({
  apiEndpoint,
  defaultPageSize = 10,
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
  extraParams: initialExtraParams = {},
  onDataFetched,
  mapResponse,
}: UseServerSideDataTableOptions<T>): UseServerSideDataTableResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: defaultPageSize,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [extraParams, setExtraParams] =
    useState<Record<string, string>>(initialExtraParams);

  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

  // Stable callback refs to prevent infinite re-render loops
  const onDataFetchedRef = useRef(onDataFetched);
  const mapResponseRef = useRef(mapResponse);

  // Keep refs updated with latest callback values
  useEffect(() => {
    onDataFetchedRef.current = onDataFetched;
  }, [onDataFetched]);

  useEffect(() => {
    mapResponseRef.current = mapResponse;
  }, [mapResponse]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setTablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, extraParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);

      // Add extra filter params
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`${apiEndpoint}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${apiEndpoint}`);
      }

      const responseData = await response.json();

      let mappedData = mapResponseRef.current
        ? mapResponseRef.current(responseData)
        : {
            items:
              responseData.data ||
              responseData.items ||
              (Object.values(responseData)[0] as T[]) ||
              [],
            pagination: responseData.pagination,
          };

      setData(mappedData.items);
      setPagination(mappedData.pagination);

      if (onDataFetchedRef.current) {
        onDataFetchedRef.current(mappedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    sortBy,
    sortOrder,
    extraParams,
    apiEndpoint,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return {
    data,
    loading,
    error,
    pagination,
    tablePagination,
    setTablePagination,
    sorting,
    setSorting,
    search,
    setSearch,
    debouncedSearch,
    refresh: fetchData,
    extraParams,
    setExtraParams,
  };
}
