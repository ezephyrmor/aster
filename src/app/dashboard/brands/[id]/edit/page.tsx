"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  industry?: string | null;
  status: string;
}

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/brands/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch brand");
        }
        const data = await response.json();
        setBrand(data);
        setName(data.name);
        setDescription(data.description || "");
        setLogo(data.logo || "");
        setWebsite(data.website || "");
        setIndustry(data.industry || "");
        setStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsFetching(false);
      }
    };

    fetchBrand();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/brands/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          logo: logo || null,
          website: website || null,
          industry: industry || null,
          status,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update brand");
      }

      router.push(`/dashboard/brands/${resolvedParams.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout
        title="Edit Brand"
        subtitle="Loading..."
        icon={
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !brand) {
    return (
      <DashboardLayout
        title="Edit Brand"
        subtitle="Error"
        icon={
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
      >
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/dashboard/brands")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Back to Brands
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Brand"
      subtitle={`Editing: ${brand?.name}`}
      icon={
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      }
    >
      <div className="max-w-2xl">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-zinc-800 shadow rounded-lg px-6 py-5">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  id="logo"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  URL to the brand's logo image.
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="Describe the brand and their business..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
