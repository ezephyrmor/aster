"use client";

import * as React from "react";
import "@/app/dashboard/datatable-demo/theme.css";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Filter configuration for generic filter support
 */
export interface FilterConfig {
  /** Unique identifier for the filter */
  id: string;
  /** Display label for the filter */
  label: string;
  /** Type of filter input */
  type: "select" | "text";
  /** Options for select filters */
  options?: { value: string; label: string }[];
  /** Current value of the filter */
  value: string;
  /** Callback when filter value changes */
  onChange: (value: string) => void;
  /** Placeholder text for text inputs */
  placeholder?: string;
}

interface ServerSideDataTableProps<TData, TValue> {
  /** Column definitions for the table */
  columns: ColumnDef<TData, TValue>[];
  /** Data to display in the table */
  data: TData[];
  /** Total number of items (from server) */
  totalCount: number;
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Key to search by (enables search if provided) */
  searchKey?: string;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Current search value */
  searchValue?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Array of filter configurations */
  filters?: FilterConfig[];
  /** Custom filter renderer (overrides default filter UI) */
  renderFilters?: () => React.ReactNode;
  /** Pagination state */
  pagination: PaginationState;
  /** Callback when pagination changes */
  onPaginationChange: (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => void;
  /** Sorting state */
  sorting: SortingState;
  /** Callback when sorting changes */
  onSortingChange: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void;
  /** Custom message when no results found */
  emptyMessage?: string;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Page size options */
  pageSizeOptions?: number[];
}

export function ServerSideDataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  isLoading,
  error,
  searchKey,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters,
  renderFilters,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  emptyMessage = "No results.",
  loadingComponent,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: ServerSideDataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  // Render filters based on configuration
  const renderFilterUI = () => {
    // If custom renderer provided, use it
    if (renderFilters) {
      return renderFilters();
    }

    // If no filters, return null
    if (!filters || filters.length === 0) {
      return null;
    }

    // Calculate column spans for grid layout
    const filterCount = filters.length;
    const getColSpan = (index: number) => {
      if (filterCount === 1) return "md:col-span-4";
      if (filterCount === 2) return "md:col-span-2";
      if (filterCount === 3) {
        return index === 2 ? "md:col-span-2" : "md:col-span-1";
      }
      return "md:col-span-1";
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {filters.map((filter, index) => (
          <div key={filter.id} className={getColSpan(index)}>
            <label className="block text-sm font-medium text-foreground mb-1">
              {filter.label}
            </label>
            {filter.type === "select" ? (
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All {filter.label}s</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="text"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                placeholder={
                  filter.placeholder || `Filter by ${filter.label}...`
                }
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Determine if we should show the filter section
  const showFilters = (filters && filters.length > 0) || renderFilters;
  const showSearch = searchKey && onSearchChange;
  const showFilterSection = showFilters || showSearch;

  return (
    <div className="w-full shadcn-theme dark">
      {/* Main Card Container */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {/* Filters and Search */}
          {showFilterSection && (
            <div className="mb-4">
              {showSearch && (
                <div className="flex items-center mb-4">
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              )}
              {renderFilterUI()}
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {loadingComponent || defaultLoadingComponent}
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {totalCount > 0 ? (
                <>
                  Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    totalCount,
                  )}{" "}
                  of {totalCount} results
                </>
              ) : (
                "No results"
              )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                  className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 text-sm"
                  value={pagination.pageSize}
                  onChange={(e) => {
                    onPaginationChange({
                      ...pagination,
                      pageIndex: 0,
                      pageSize: Number(e.target.value),
                    });
                  }}
                >
                  {pageSizeOptions.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pagination.pageIndex + 1} of {totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() =>
                    onPaginationChange({ ...pagination, pageIndex: 0 })
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    onPaginationChange({
                      ...pagination,
                      pageIndex: pagination.pageIndex - 1,
                    })
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    onPaginationChange({
                      ...pagination,
                      pageIndex: pagination.pageIndex + 1,
                    })
                  }
                  disabled={pagination.pageIndex >= totalPages - 1}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() =>
                    onPaginationChange({
                      ...pagination,
                      pageIndex: totalPages - 1,
                    })
                  }
                  disabled={pagination.pageIndex >= totalPages - 1}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
