"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BrandForm from "@/components/forms/BrandForm";
import type { CreateBrandData } from "@/lib/validations";
import { useToast } from "@/lib/toast";

export default function CreateBrandPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (data: CreateBrandData) => {
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create brand");
      }

      addToast("Brand created successfully", "success");
      router.push("/dashboard/brands");
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

  return (
    <DashboardLayout
      title="Create Brand"
      subtitle="Create a new client brand"
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
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    >
      <div className="max-w-2xl">
        <BrandForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
}
