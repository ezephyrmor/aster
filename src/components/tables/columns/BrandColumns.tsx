import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  industry?: string | null;
  status: string;
  company?: {
    id: number;
    name: string;
  } | null;
  manager?: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  _count: {
    teams: number;
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "inactive":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "archived":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getManagerName(manager: Brand["manager"]) {
  if (!manager) return "-";
  if (manager.employeeProfile) {
    return `${manager.employeeProfile.firstName} ${manager.employeeProfile.lastName}`;
  }
  return manager.username;
}

export const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Brand Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const description = row.original.description;
      return (
        <div>
          <div className="font-medium">{name}</div>
          {description && (
            <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
              {description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "industry",
    header: () => <div className="hidden md:block">Industry</div>,
    cell: ({ getValue }) => {
      const industry = getValue() as string | null;
      return (
        <div className="hidden md:block text-muted-foreground">
          {industry || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "company.name",
    header: () => <div className="hidden lg:block">Company</div>,
    cell: ({ row }) => {
      const company = row.original.company;
      return (
        <div className="hidden lg:block text-muted-foreground">
          {company?.name || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
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
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
        >
          {status}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "_count.teams",
    header: () => <div className="hidden lg:block">Teams</div>,
    cell: ({ row }) => {
      const teamsCount = row.original._count.teams;
      return (
        <div className="hidden lg:block text-muted-foreground">
          {teamsCount} team{teamsCount !== 1 ? "s" : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "website",
    header: () => <div className="hidden xl:block">Website</div>,
    cell: ({ getValue }) => {
      const website = getValue() as string | null;
      if (!website)
        return <span className="hidden xl:block text-muted-foreground">-</span>;
      const displayUrl = website.replace(/^https?:\/\//, "").substring(0, 30);
      return (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {displayUrl}
          {website.length > 30 ? "..." : ""}
        </a>
      );
    },
  },
  {
    accessorKey: "manager",
    header: () => <div className="hidden lg:block">Manager</div>,
    cell: ({ row }) => {
      const manager = row.original.manager;
      return (
        <div className="hidden lg:block text-muted-foreground">
          {getManagerName(manager)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const brandId = row.original.id;
      return (
        <div className="text-right space-x-2">
          <Link
            href={`/dashboard/brands/${brandId}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
          >
            View
          </Link>
          <Link
            href={`/dashboard/brands/${brandId}/edit`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
