import { Suspense } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

async function getBrands() {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/brands`,
      {
        cache: "no-cache",
      },
    );
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <DashboardLayout
      title="Brands"
      subtitle="Manage client brands and their teams"
    >
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all client brands including team count and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/brands/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
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
          </Link>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        {brands.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No brands
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new brand.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/dashboard/brands/${brand.id}`}
                className="block bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {brand.name}
                        </h3>
                        <span
                          className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            brand.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : brand.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {brand.status}
                        </span>
                      </div>
                      {brand.description && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {brand.description}
                        </p>
                      )}
                      {brand.industry && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {brand.industry}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {brand._count?.teams || 0} teams
                      </span>
                    </div>
                    {brand.website && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        {brand.website.replace(/^https?:\/\//, "")}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Suspense>
    </DashboardLayout>
  );
}
