"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import UserForm from "@/components/UserForm";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";

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
  const [activeTab, setActiveTab] = useState<"profile" | "status">("profile");
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchStatusHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetch(`/api/users/${resolvedParams.id}/status`);
      if (response.ok) {
        const result = await response.json();
        setStatusHistory(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch status history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

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

  useEffect(() => {
    if (activeTab === "status") {
      fetchStatusHistory();
    }
  }, [activeTab, resolvedParams.id]);

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

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              activeTab === "profile"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              activeTab === "status"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Status History
          </button>
        </div>
      </div>

      {activeTab === "profile" && userData && (
        <UserForm
          initialData={userData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      )}

      {activeTab === "status" && (
        <div>
          {isHistoryLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : statusHistory.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No status history records found for this employee.
            </div>
          ) : (
            <div className="space-y-4">
              {statusHistory.map((record) => (
                <div
                  key={record.id}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-zinc-500 dark:text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {record.status.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Changed by{" "}
                          {record.performedByUser?.employeeProfile?.firstName}{" "}
                          {record.performedByUser?.employeeProfile?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {format(new Date(record.effectiveDate), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {format(new Date(record.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  {record.reason && (
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded">
                      {record.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
