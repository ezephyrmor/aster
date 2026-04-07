import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Team {
  id: number;
  name: string;
  description?: string | null;
  brandId: number;
  brand: {
    id: number;
    name: string;
  };
  _count: {
    members: number;
  };
}

export interface Brand {
  id: number;
  name: string;
}

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Team Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const name = getValue() as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "brand",
    header: () => <div>Brand</div>,
    cell: ({ row }) => {
      const brand = row.original.brand;
      return (
        <Link
          href={`/dashboard/brands/${brand.id}`}
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {brand.name}
        </Link>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.brand.id.toString());
    },
  },
  {
    accessorKey: "membersCount",
    accessorFn: (row) => row._count?.members ?? 0,
    header: () => <div className="hidden md:block">Members</div>,
    cell: ({ row }) => {
      const membersCount = row.original._count?.members ?? 0;
      return (
        <div className="hidden md:block text-muted-foreground">
          {membersCount} member{membersCount !== 1 ? "s" : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="hidden lg:block">Description</div>,
    cell: ({ getValue }) => {
      const description = getValue() as string | null;
      return (
        <div className="hidden lg:block text-muted-foreground line-clamp-1 max-w-xs">
          {description || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const teamId = row.original.id;
      return (
        <div className="text-right space-x-2">
          <Link
            href={`/dashboard/teams/${teamId}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
          >
            View
          </Link>
          <Link
            href={`/dashboard/teams/${teamId}/edit`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
