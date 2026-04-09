"use client";

import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import { columns, User } from "@/components/UserColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface UserListProps {
  /** Optional callback when Add User button is clicked */
  onAddClick?: () => void;
}

export default function UserList({ onAddClick }: UserListProps) {
  const {
    data: users,
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
  } = useServerSideDataTable<User>({
    apiEndpoint: "/api/users",
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Build filters configuration
  const filters: FilterConfig[] = [
    {
      id: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "admin", label: "Admin" },
        { value: "hr", label: "HR" },
        { value: "employee", label: "Employee" },
      ],
      value: "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, role: value })),
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "on_leave", label: "On Leave" },
        { value: "terminated", label: "Terminated" },
        { value: "inactive", label: "Inactive" },
      ],
      value: "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, status: value })),
    },
  ];

  // Create the Add User button if onAddClick is provided
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
      Add User
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={users}
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
