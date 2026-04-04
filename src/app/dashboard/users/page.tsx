import { Suspense } from "react";
import Link from "next/link";
import UserList from "@/components/UserList";
import DashboardLayout from "@/components/DashboardLayout";

async function getUsers() {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/users`,
      {
        cache: "no-cache",
      },
    );
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <DashboardLayout
      title="Users"
      subtitle="Manage employee accounts and profiles"
    >
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all users in the system including their name, role, and
            status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/users/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add User
          </Link>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <UserList users={users} />
      </Suspense>
    </DashboardLayout>
  );
}
