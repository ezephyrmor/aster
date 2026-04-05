"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Brand {
  id: number;
  name: string;
  description?: string | null;
}

interface Team {
  id: number;
  name: string;
  description?: string | null;
  brandId: number;
  brand: {
    id: number;
    name: string;
  };
}

export default function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands for the dropdown
        const brandsResponse = await fetch("/api/brands");
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          setBrands(brandsData.brands || []);
        }

        // Fetch team data
        const teamResponse = await fetch(`/api/teams/${resolvedParams.id}`);
        if (!teamResponse.ok) {
          throw new Error("Failed to fetch team");
        }
        const teamData: Team = await teamResponse.json();
        setTeam(teamData);
        setName(teamData.name);
        setDescription(teamData.description || "");
        setBrandId(teamData.brandId.toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!brandId) {
      setError("Please select a brand");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/teams/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          brandId: parseInt(brandId),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update team");
      }

      router.push(`/dashboard/teams/${resolvedParams.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout title="Edit Team" subtitle="Loading...">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !team) {
    return (
      <DashboardLayout title="Edit Team" subtitle="Error">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/dashboard/teams")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Back to Teams
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Team" subtitle={`Editing: ${team?.name}`}>
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
                  htmlFor="brandId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Brand *
                </label>
                <select
                  name="brandId"
                  id="brandId"
                  required
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="">Select a brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Every team must belong to a brand/client.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="e.g., Engineering, Marketing, Sales"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This will be the unique identifier for your team.
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
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  placeholder="Describe the team's purpose and responsibilities..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional: Add a brief description of what this team does.
                </p>
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
