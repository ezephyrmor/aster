zimport { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Helper to safely extract values from nested objects or direct strings
const extractValue = (value: any, property = "name") => {
  if (!value) return null;
  if (typeof value === "object" && value !== null) {
    return value[property] || null;
  }
  return value;
};

export interface User {
  id: number;
  username: string;
  company?: any | null;
  employeeProfile: any | null;
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "on_leave":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "terminated":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "hr":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

function formatStatus(status: string | null | undefined) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "employeeProfile",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const profile = row.original.employeeProfile;
      return (
        <div className="text-muted-foreground">
          {profile ? `${profile.firstName} ${profile.lastName}` : "-"}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original.employeeProfile;
      const b = rowB.original.employeeProfile;
      const nameA = a ? `${a.firstName} ${a.lastName}`.toLowerCase() : "";
      const nameB = b ? `${b.firstName} ${b.lastName}`.toLowerCase() : "";
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "employeeProfile.position",
    header: () => <div className="hidden md:block">Position</div>,
    cell: ({ row }) => {
      const position = extractValue(row.original.employeeProfile?.position);
      return (
        <div className="hidden md:block text-muted-foreground">
          {position || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "employeeProfile.department",
    header: () => <div className="hidden lg:block">Department</div>,
    cell: ({ row }) => {
      const department = extractValue(row.original.employeeProfile?.department);
      return (
        <div className="hidden lg:block text-muted-foreground">
          {department || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "company",
    header: () => <div className="hidden xl:block">Company</div>,
    cell: ({ row }) => {
      const company = extractValue(row.original.company);
      return (
        <div className="hidden xl:block text-muted-foreground">
          {company || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = extractValue(row.original.employeeProfile?.role);
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
        >
          {role}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "employeeProfile.status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = extractValue(row.original.employeeProfile?.status);
      if (!status) return null;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
        >
          {formatStatus(status)}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const userId = row.original.id;
      return (
        <div className="text-right">
          <Link
            href={`/dashboard/users/${userId}`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
