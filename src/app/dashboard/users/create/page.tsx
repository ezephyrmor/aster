"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import UserForm from "@/components/UserForm";
import DashboardLayout from "@/components/DashboardLayout";

interface UserFormData {
  username: string;
  password: string;
  role: "admin" | "hr" | "employee";
  firstName: string;
  lastName: string;
  middleName?: string;
  contactNumber?: string;
  personalEmail?: string;
  address?: string;
  dateOfBirth?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create user");
      }

      router.push("/dashboard/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <DashboardLayout
      title="Add New User"
      subtitle="Create a new employee account"
    >
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <UserForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </DashboardLayout>
  );
}
