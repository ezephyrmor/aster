"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import UserForm from "@/components/forms/UserForm";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface UserFormData {
  username?: string;
  password?: string;
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

interface GeneratedCredentials {
  username: string;
  password: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] =
    useState<GeneratedCredentials | null>(null);

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

      const result = await response.json();

      // Check if credentials were generated
      if (result.generatedPassword) {
        setGeneratedCredentials({
          username: result.username,
          password: result.generatedPassword,
        });
      } else {
        router.push("/dashboard/users");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleCopyCredentials = () => {
    if (generatedCredentials) {
      const text = `Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <DashboardLayout
      title="Create Employee Profile"
      subtitle="Add a new employee to the system"
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      }
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

      {generatedCredentials ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                User Created Successfully!
              </h2>
            </div>
            <p className="text-gray-600 dark:text-zinc-400 mb-4">
              The user has been created with auto-generated credentials. Please
              share these credentials with the user securely.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
                Generated Credentials
              </h3>
              <button
                onClick={handleCopyCredentials}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-zinc-400">
                  Username:
                </span>
                <p className="text-lg font-mono font-medium text-gray-900 dark:text-zinc-100 ml-2">
                  {generatedCredentials.username}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-zinc-400">
                  Password:
                </span>
                <p className="text-lg font-mono font-medium text-gray-900 dark:text-zinc-100 ml-2">
                  {generatedCredentials.password}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setGeneratedCredentials(null);
                router.push("/dashboard/users");
                router.refresh();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Done
            </button>
            <button
              onClick={() => setGeneratedCredentials(null)}
              className="px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700"
            >
              Create Another User
            </button>
          </div>
        </div>
      ) : (
        <UserForm onSubmit={handleSubmit} onCancel={() => router.back()} />
      )}
    </DashboardLayout>
  );
}
