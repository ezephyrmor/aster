"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  industry?: string | null;
  status: string;
  _count: {
    teams: number;
  };
}

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

export default function BrandList() {
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
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, industryFilter]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
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
              placeholder="Search by brand name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            />
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Industry
            </label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
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
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Brand Name {getSortIcon("name")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell"
                >
                  Industry
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status {getSortIcon("status")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell"
                >
                  Teams
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell"
                >
                  Website
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No brands found
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {brand.name}
                          </div>
                          {brand.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                              {brand.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {brand.industry || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(brand.status)}`}
                      >
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {brand._count.teams} teams
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                        >
                          {brand.website
                            .replace(/^https?:\/\//, "")
                            .substring(0, 30)}
                          {brand.website.length > 30 ? "..." : ""}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/brands/${brand.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/brands/${brand.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
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
    </div>
  );
}
