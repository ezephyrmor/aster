"use client";

import Link from "next/link";

interface User {
  id: number;
  username: string;
  role: "admin" | "hr" | "employee";
  createdAt: string;
  employeeProfile?: {
    firstName: string;
    lastName: string;
    position?: string | null;
    department?: string | null;
    status: "active" | "on_leave" | "terminated" | "inactive";
  } | null;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      on_leave: "bg-yellow-100 text-yellow-800",
      terminated: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
      active: "Active",
      on_leave: "On Leave",
      terminated: "Terminated",
      inactive: "Inactive",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          statusStyles.inactive
        }`}
      >
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getRoleBadge = (role: "admin" | "hr" | "employee" | string) => {
    const roleStyles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      hr: "bg-blue-100 text-blue-800",
      employee: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          roleStyles[role] || roleStyles.employee
        }`}
      >
        {role}
      </span>
    );
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Employee
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Position
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.employeeProfile
                          ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`
                          : user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.employeeProfile?.position || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.employeeProfile?.department || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.employeeProfile &&
                    getStatusBadge(user.employeeProfile.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/users/${user.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
