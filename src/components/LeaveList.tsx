"use client";

import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import { columns, Leave } from "@/components/LeaveColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface LeaveListProps {
  onAddClick?: () => void;
}

export default function LeaveList({ onAddClick }: LeaveListProps) {
  const {
    data: leaves,
    loading,
    error,
    pagination,
    tablePagination,
    setTablePagination,
    sorting,
    setSorting,
    search,
    setSearch,
    setExtraParams,
  } = useServerSideDataTable<Leave>({
    apiEndpoint: "/api/leaves/requests",
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "cancelled", label: "Cancelled" },
      ],
      value: "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, status: value })),
    },
    {
      id: "type",
      label: "Leave Type",
      type: "select",
      options: [
        { value: "annual", label: "Annual Leave" },
        { value: "sick", label: "Sick Leave" },
        { value: "emergency", label: "Emergency Leave" },
        { value: "bereavement", label: "Bereavement Leave" },
      ],
      value: "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, type: value })),
    },
  ];

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
      Request Leave
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={leaves}
      totalCount={pagination.total}
      isLoading={loading}
      error={error}
      searchKey="name"
      searchPlaceholder="Search by employee name..."
      searchValue={search}
      onSearchChange={setSearch}
      searchAction={searchAction}
      filters={filters}
      pagination={tablePagination}
      onPaginationChange={setTablePagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
