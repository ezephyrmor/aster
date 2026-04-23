"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BrandForm from "@/components/forms/BrandForm";
import type { UpdateBrandData } from "@/lib/validations";
import { useToast } from "@/lib/toast";

interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  status: string;
  industryId?: number | null;
  managerId?: number | null;
}

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsFetching(false);
      }
    };

    fetchBrand();
  }, [resolvedParams.id]);

  const handleSubmit = async (data: UpdateBrandData) => {
    try {
      const response = await fetch(`/api/brands/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update brand");
      }

      addToast("Brand updated successfully", "success");
      router.push(`/dashboard/brands/${resolvedParams.id}`);
      router.refresh();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "An error occurred",
        "error",
      );
    }
  };

  const handleCancel = () => {
    router.back();
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
        {brand && (
          <BrandForm
            initialData={brand}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
