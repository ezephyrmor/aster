"use client";

import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/tables/ServerSideDataTable";
import { columns, Team } from "@/components/tables/columns/TeamColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface TeamListProps {
  onAddClick?: () => void;
}

export default function TeamList({ onAddClick }: TeamListProps) {
  const {
    data: teams,
    loading,
    error,
    pagination,
    tablePagination,
    setTablePagination,
    sorting,
    setSorting,
    search,
    setSearch,
    extraParams,
    setExtraParams,
  } = useServerSideDataTable<Team>({
    apiEndpoint: "/api/teams",
    defaultSortBy: "name",
    defaultSortOrder: "asc",
  });

  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      value: extraParams.status || "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, status: value })),
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
      Create Team
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={teams}
      totalCount={pagination.total}
      isLoading={loading}
      error={error}
      searchKey="name"
      searchPlaceholder="Search by team name..."
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
