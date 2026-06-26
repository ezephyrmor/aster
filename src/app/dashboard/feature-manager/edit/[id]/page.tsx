"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FeatureForm, { type FeatureFormData } from "@/components/forms/FeatureForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";

export default function EditFeaturePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const [feature, setFeature] = useState<FeatureFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await fetch(`/api/features/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch feature");
        }

        const data = await response.json();
        setFeature(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFeature();
  }, [id]);

  const handleSubmit = async (data: FeatureFormData) => {
    try {
      const response = await fetch(`/api/features/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update feature");
      }

      router.push("/dashboard/feature-manager");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Edit Feature"
        subtitle="Loading feature data..."
        icon={<Icons.Settings className="w-6 h-6 text-white" />}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !feature) {
    return (
      <DashboardLayout
        title="Edit Feature"
        subtitle="Error loading feature"
        icon={<Icons.Settings className="w-6 h-6 text-white" />}
      >
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </h3>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Feature"
      subtitle="Update system feature details"
      icon={<Icons.Settings className="w-6 h-6 text-white" />}
    >
      {error && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      {feature && (
        <FeatureForm
          initialData={feature}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      )}
    </DashboardLayout>
  );
}
