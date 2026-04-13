"use client";

import { useState } from "react";
import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import { columns, Brand } from "@/components/BrandColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface BrandListProps {
  /** Optional callback when Create Brand button is clicked */
  onAddClick?: () => void;
}

export default function BrandList({ onAddClick }: BrandListProps) {
  const [industries, setIndustries] = useState<string[]>([]);

  const {
    data: brands,
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
  } = useServerSideDataTable<Brand>({
    apiEndpoint: "/api/brands",
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    onDataFetched: (data) => {
      setIndustries(data.industries || []);
    },
  });

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
      value: extraParams.status || "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, status: value })),
    },
    {
      id: "industry",
      label: "Industry",
      type: "select",
      options: industries.map((ind: string) => ({ value: ind, label: ind })),
      value: extraParams.industry || "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, industry: value })),
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
      onSortingChange={setSorting}
    />
  );
}
