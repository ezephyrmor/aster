"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import UserForm from "@/components/UserForm";
import DashboardLayout from "@/components/DashboardLayout";

interface UserFormData {
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
  status?: "active" | "on_leave" | "terminated" | "inactive";
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserFormData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();

        // Combine user and employeeProfile data for the form
        const formData: UserFormData = {
          role: data.role?.name || "employee",
          firstName: data.employeeProfile?.firstName || "",
          lastName: data.employeeProfile?.lastName || "",
          middleName: data.employeeProfile?.middleName || "",
          contactNumber: data.employeeProfile?.contactNumber || "",
          personalEmail: data.employeeProfile?.personalEmail || "",
          address: data.employeeProfile?.address || "",
          dateOfBirth: data.employeeProfile?.dateOfBirth
            ? new Date(data.employeeProfile.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : "",
          position: data.employeeProfile?.position || "",
          department: data.employeeProfile?.department || "",
          hireDate: data.employeeProfile?.hireDate
            ? new Date(data.employeeProfile.hireDate)
                .toISOString()
                .split("T")[0]
            : "",
          emergencyContactName:
            data.employeeProfile?.emergencyContactName || "",
          emergencyContactNumber:
            data.employeeProfile?.emergencyContactNumber || "",
          emergencyContactRelation:
            data.employeeProfile?.emergencyContactRelation || "",
          status: data.employeeProfile?.status || "active",
        };

        setUserData(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [resolvedParams.id]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch(`/api/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update user");
      }

      router.push("/dashboard/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Edit User"
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

  return (
    <DashboardLayout
      title="Edit User"
      subtitle="Update employee information"
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
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {userData && (
        <UserForm
          initialData={userData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      )}
    </DashboardLayout>
  );
}
