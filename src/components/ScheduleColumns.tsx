import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WorkSchedule {
  id: number;
  userId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
      department?: string | null;
      position?: string | null;
    } | null;
    teams?: { name: string }[];
  };
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function getFullName(
  employee: { firstName: string; lastName: string } | null,
  username: string,
) {
  if (employee) {
    return `${employee.firstName} ${employee.lastName}`;
  }
  return username;
}

function getDayName(day: number) {
  return DAYS_OF_WEEK.find((d) => d.value === day)?.label || "Unknown";
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export interface ScheduleAction {
  type: "edit" | "delete";
  schedule: WorkSchedule;
}

export interface UseScheduleColumnsProps {
  onAction?: (action: ScheduleAction) => void;
}

export function useScheduleColumns({ onAction }: UseScheduleColumnsProps = {}) {
  const columns: ColumnDef<WorkSchedule>[] = [
    {
      accessorKey: "user",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Employee
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return (
            <div>
              <div className="font-medium">Unknown</div>
              <div className="text-sm text-muted-foreground">
                User ID: {row.original.userId}
              </div>
            </div>
          );
        }
        return (
          <div>
            <div className="font-medium">
              {getFullName(user.employeeProfile || null, user.username)}
            </div>
            <div className="text-sm text-muted-foreground">{user.username}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "dayOfWeek",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Day
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const day = getValue() as number;
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-sm rounded-full">
            {getDayName(day)}
          </span>
        );
      },
    },
    {
      id: "time",
      header: () => <div>Time</div>,
      cell: ({ row }) => {
        const { startTime, endTime } = row.original;
        return (
          <div className="text-muted-foreground">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>
        );
      },
    },
    {
      accessorKey: "breakMinutes",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Break
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const breakMinutes = getValue() as number;
        return <div className="text-muted-foreground">{breakMinutes} min</div>;
      },
    },
    {
      accessorKey: "effectiveFrom",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Effective Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const effectiveFrom = row.original.effectiveFrom;
        const effectiveTo = row.original.effectiveTo;
        return (
          <div>
            <div>{new Date(effectiveFrom).toLocaleDateString()}</div>
            {effectiveTo && (
              <div className="text-xs text-muted-foreground">
                To: {new Date(effectiveTo).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const schedule = row.original;
        return (
          <div className="text-right space-x-2">
            <button
              onClick={() => onAction?.({ type: "edit", schedule })}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onAction?.({ type: "delete", schedule })}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return columns;
}

export const columns: ColumnDef<WorkSchedule>[] = [
  {
    accessorKey: "user",
    header: () => <div>Employee</div>,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return (
          <div>
            <div className="font-medium">Unknown</div>
            <div className="text-sm text-muted-foreground">
              User ID: {row.original.userId}
            </div>
          </div>
        );
      }
      return (
        <div>
          <div className="font-medium">
            {getFullName(user.employeeProfile || null, user.username)}
          </div>
          <div className="text-sm text-muted-foreground">{user.username}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "dayOfWeek",
    header: () => <div>Day</div>,
    cell: ({ getValue }) => {
      const day = getValue() as number;
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-sm rounded-full">
          {getDayName(day)}
        </span>
      );
    },
  },
  {
    id: "time",
    header: () => <div>Time</div>,
    cell: ({ row }) => {
      const { startTime, endTime } = row.original;
      return (
        <div className="text-muted-foreground">
          {formatTime(startTime)} - {formatTime(endTime)}
        </div>
      );
    },
  },
  {
    accessorKey: "breakMinutes",
    header: () => <div>Break</div>,
    cell: ({ getValue }) => {
      const breakMinutes = getValue() as number;
      return <div className="text-muted-foreground">{breakMinutes} min</div>;
    },
  },
  {
    accessorKey: "effectiveFrom",
    header: () => <div>Effective Date</div>,
    cell: ({ row }) => {
      const effectiveFrom = row.original.effectiveFrom;
      const effectiveTo = row.original.effectiveTo;
      return (
        <div>
          <div>{new Date(effectiveFrom).toLocaleDateString()}</div>
          {effectiveTo && (
            <div className="text-xs text-muted-foreground">
              To: {new Date(effectiveTo).toLocaleDateString()}
            </div>
          )}
        </div>
      );
    },
  },
];
