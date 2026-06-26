"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FeatureForm, { type FeatureFormData } from "@/components/forms/FeatureForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";


export default function CreateFeaturePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FeatureFormData) => {
    try {
      const response = await fetch("/api/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create feature");
      }

      router.push("/dashboard/feature-manager");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <DashboardLayout
      title="Create Feature"
      subtitle="Add a new system feature"
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

      <FeatureForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </DashboardLayout>
  );
}
