"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface LeaveRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  isPaid: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
    } | null;
  };
  leaveType: {
    id: number;
    name: string;
    color: string;
  };
  status: {
    id: number;
    name: string;
    color: string;
    isFinal: boolean;
  };
  reviewer: {
    username: string;
  } | null;
  reviewedAt: string | null;
  reviewComment: string | null;
}

function getStatusColor(color: string) {
  const colors: Record<string, string> = {
    yellow:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    green:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    purple:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    orange:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return colors[color] || "bg-gray-100 text-gray-800";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

function getFullName(
  employeeProfile: { firstName: string; lastName: string } | null,
  username: string,
) {
  if (employeeProfile) {
    return `${employeeProfile.firstName} ${employeeProfile.lastName}`;
  }
  return username;
}

interface LeaveActionsCellProps {
  request: LeaveRequest;
  onAction: (request: LeaveRequest, action: "approve" | "deny") => void;
  onViewDetails: (request: LeaveRequest) => void;
}

function LeaveActionsCell({
  request,
  onAction,
  onViewDetails,
}: LeaveActionsCellProps) {
  return (
    <div className="text-right flex items-center justify-end gap-2">
      <button
        onClick={() => onViewDetails(request)}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
      >
        View
      </button>
      {!request.status.isFinal && (
        <>
          <button
            onClick={() => onAction(request, "approve")}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => onAction(request, "deny")}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
          >
            Deny
          </button>
        </>
      )}
    </div>
  );
}

interface UseLeaveColumnsProps {
  onAction?: (request: LeaveRequest, action: "approve" | "deny") => void;
  onViewDetails?: (request: LeaveRequest) => void;
}

export function useLeaveColumns({
  onAction,
  onViewDetails,
}: UseLeaveColumnsProps = {}) {
  const columns: ColumnDef<LeaveRequest>[] = [
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
        return (
          <div className="font-medium">
            {getFullName(user.employeeProfile, user.username)}
          </div>
        );
      },
    },
    {
      accessorKey: "leaveType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Leave Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const leaveType = row.original.leaveType;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leaveType.color)}`}
          >
            {leaveType.name}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.leaveType.id.toString());
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Start Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            End Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      id: "days",
      header: () => <div>Days</div>,
      cell: ({ row }) => {
        const days = calculateDays(
          row.original.startDate,
          row.original.endDate,
        );
        return <div className="text-muted-foreground">{days}</div>;
      },
    },
    {
      accessorKey: "isPaid",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const isPaid = getValue() as boolean;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isPaid
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            }`}
          >
            {isPaid ? "Paid" : "Unpaid"}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "true") return row.original.isPaid === true;
        if (value === "false") return row.original.isPaid === false;
        return true;
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
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.color)}`}
          >
            {status.name}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.status.id.toString());
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <LeaveActionsCell
            request={row.original}
            onAction={onAction || (() => {})}
            onViewDetails={onViewDetails || (() => {})}
          />
        );
      },
    },
  ];

  return columns;
}

export const columns: ColumnDef<LeaveRequest>[] = [
  // Default columns without actions (for simple display)
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
      return (
        <div className="font-medium">
          {getFullName(user.employeeProfile, user.username)}
        </div>
      );
    },
  },
  {
    accessorKey: "leaveType",
    header: () => <div>Leave Type</div>,
    cell: ({ row }) => {
      const leaveType = row.original.leaveType;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leaveType.color)}`}
        >
          {leaveType.name}
        </span>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "endDate",
    header: () => <div>End Date</div>,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    id: "days",
    header: () => <div>Days</div>,
    cell: ({ row }) => {
      const days = calculateDays(row.original.startDate, row.original.endDate);
      return <div className="text-muted-foreground">{days}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.color)}`}
        >
          {status.name}
        </span>
      );
    },
  },
];
