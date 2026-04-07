"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/DashboardLayout";
import { ThemedDataTable } from "@/components/DataTable";

import "@/app/dashboard/datatable-demo/theme.css";

// Sample employee data types
export type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  hireDate: string;
};

// Sample data for the demonstration
const data: Employee[] = [
  {
    id: "EMP001",
    name: "Maria Santos",
    email: "maria.santos@company.com",
    position: "Senior Developer",
    department: "Engineering",
    status: "Active",
    hireDate: "2022-03-15",
  },
  {
    id: "EMP002",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@company.com",
    position: "Product Manager",
    department: "Product",
    status: "Active",
    hireDate: "2021-07-22",
  },
  {
    id: "EMP003",
    name: "Ana Reyes",
    email: "ana.reyes@company.com",
    position: "UX Designer",
    department: "Design",
    status: "On Leave",
    hireDate: "2023-01-10",
  },
  {
    id: "EMP004",
    name: "Carlos Garcia",
    email: "carlos.garcia@company.com",
    position: "DevOps Engineer",
    department: "Engineering",
    status: "Active",
    hireDate: "2022-09-05",
  },
  {
    id: "EMP005",
    name: "Sofia Lopez",
    email: "sofia.lopez@company.com",
    position: "HR Manager",
    department: "Human Resources",
    status: "Active",
    hireDate: "2020-11-18",
  },
  {
    id: "EMP006",
    name: "Miguel Torres",
    email: "miguel.torres@company.com",
    position: "Marketing Specialist",
    department: "Marketing",
    status: "Inactive",
    hireDate: "2023-04-02",
  },
  {
    id: "EMP007",
    name: "Isabella Fernandez",
    email: "isabella.fernandez@company.com",
    position: "Financial Analyst",
    department: "Finance",
    status: "Active",
    hireDate: "2022-06-14",
  },
  {
    id: "EMP008",
    name: "Rafael Mendoza",
    email: "rafael.mendoza@company.com",
    position: "QA Engineer",
    department: "Engineering",
    status: "Active",
    hireDate: "2023-02-28",
  },
  {
    id: "EMP009",
    name: "Elena Rodriguez",
    email: "elena.rodriguez@company.com",
    position: "Content Writer",
    department: "Marketing",
    status: "On Leave",
    hireDate: "2022-12-01",
  },
  {
    id: "EMP010",
    name: "Diego Morales",
    email: "diego.morales@company.com",
    position: "Backend Developer",
    department: "Engineering",
    status: "Active",
    hireDate: "2021-05-20",
  },
  {
    id: "EMP011",
    name: "Carmen Jimenez",
    email: "carmen.jimenez@company.com",
    position: "UI Designer",
    department: "Design",
    status: "Active",
    hireDate: "2023-08-15",
  },
  {
    id: "EMP012",
    name: "Antonio Ruiz",
    email: "antonio.ruiz@company.com",
    position: "Project Manager",
    department: "Product",
    status: "Active",
    hireDate: "2020-09-10",
  },
  {
    id: "EMP013",
    name: "Lucia Herrera",
    email: "lucia.herrera@company.com",
    position: "Data Scientist",
    department: "Engineering",
    status: "Active",
    hireDate: "2022-04-25",
  },
  {
    id: "EMP014",
    name: "Pablo Vargas",
    email: "pablo.vargas@company.com",
    position: "Sales Representative",
    department: "Sales",
    status: "Inactive",
    hireDate: "2023-06-12",
  },
  {
    id: "EMP015",
    name: "Teresa Castro",
    email: "teresa.castro@company.com",
    position: "Accountant",
    department: "Finance",
    status: "Active",
    hireDate: "2021-10-30",
  },
  {
    id: "EMP016",
    name: "Francisco Ortega",
    email: "francisco.ortega@company.com",
    position: "Frontend Developer",
    department: "Engineering",
    status: "Active",
    hireDate: "2023-03-08",
  },
  {
    id: "EMP017",
    name: "Rosa Medina",
    email: "rosa.medina@company.com",
    position: "Recruiter",
    department: "Human Resources",
    status: "Active",
    hireDate: "2022-08-22",
  },
  {
    id: "EMP018",
    name: "Javier Silva",
    email: "javier.silva@company.com",
    position: "System Administrator",
    department: "Engineering",
    status: "On Leave",
    hireDate: "2021-02-14",
  },
  {
    id: "EMP019",
    name: "Marta Guerrero",
    email: "marta.guerrero@company.com",
    position: "Brand Manager",
    department: "Marketing",
    status: "Active",
    hireDate: "2022-11-05",
  },
  {
    id: "EMP020",
    name: "Alberto Ramos",
    email: "alberto.ramos@company.com",
    position: "Full Stack Developer",
    department: "Engineering",
    status: "Active",
    hireDate: "2023-01-20",
  },
];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "On Leave":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}
    >
      {status}
    </span>
  );
}

// Actions cell component
function ActionsCell({ employee }: { employee: Employee }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Edit employee</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 dark:text-red-400">
          Delete employee
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Column definitions
export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "hireDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Hire Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell employee={row.original} />,
  },
];

export default function DataTableDemoPage() {
  return (
    <DashboardLayout
      title="DataTable Demo"
      subtitle="A demonstration of the shadcn/ui DataTable component with sorting, filtering, and pagination."
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
            d="M3 10h18M3 14h18M3 10h18M3 14h18"
          />
        </svg>
      }
    >
      <ThemedDataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search employees..."
        defaultTheme="dark"
      />
    </DashboardLayout>
  );
}
