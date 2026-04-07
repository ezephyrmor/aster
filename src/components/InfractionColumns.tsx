import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Infraction {
  id: number;
  userId: number;
  offenseId: number;
  typeId: number;
  date: string;
  details: string | null;
  comment: string | null;
  acknowledgedBy: number | null;
  acknowledgedAt: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
      department: { name: string } | null;
      position: { name: string } | null;
    } | null;
  };
  offense: {
    id: number;
    name: string;
    severityLevel: number;
    type: {
      id: number;
      name: string;
      color: string;
    };
  };
  type: {
    id: number;
    name: string;
    color: string;
  };
  ackUser: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

function getFullName(infraction: Infraction) {
  if (!infraction.user) {
    return "Unknown";
  }
  if (infraction.user.employeeProfile) {
    return `${infraction.user.employeeProfile.firstName} ${infraction.user.employeeProfile.lastName}`;
  }
  return infraction.user.username;
}

function getSeverityLabel(level: number) {
  switch (level) {
    case 1:
      return "Minor";
    case 2:
      return "Major";
    case 3:
      return "Severe";
    default:
      return "Unknown";
  }
}

function getSeverityColor(level: number) {
  switch (level) {
    case 1:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case 2:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case 3:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getAckStatus(infraction: Infraction) {
  if (infraction.acknowledgedBy) {
    return {
      status: "Acknowledged",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }
  return {
    status: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface InfractionAction {
  type: "view" | "acknowledge" | "edit";
  infraction: Infraction;
}

export interface UseInfractionColumnsProps {
  onAction?: (action: InfractionAction) => void;
}

export function useInfractionColumns({
  onAction,
}: UseInfractionColumnsProps = {}) {
  const columns: ColumnDef<Infraction>[] = [
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
        const infraction = row.original;
        if (!infraction.user) {
          return (
            <div>
              <div className="font-medium">Unknown</div>
              <div className="text-sm text-muted-foreground">
                User ID: {infraction.userId}
              </div>
            </div>
          );
        }
        const profile = infraction.user.employeeProfile;
        return (
          <div>
            <div className="font-medium">{getFullName(infraction)}</div>
            <div className="text-sm text-muted-foreground">
              {infraction.user.username}
            </div>
            {profile?.department && (
              <div className="text-xs text-muted-foreground">
                {profile.department.name}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => <div>Type</div>,
      cell: ({ row }) => {
        const type = row.original.type;
        if (!type) {
          return (
            <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
              Unknown
            </span>
          );
        }
        return (
          <span
            className="px-2 py-1 text-sm rounded-full"
            style={{
              backgroundColor: `var(--tw-${type.color}-100)`,
              color: `var(--tw-${type.color}-800)`,
            }}
          >
            {type.name}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.type.id.toString());
      },
    },
    {
      accessorKey: "offense",
      header: () => <div>Offense</div>,
      cell: ({ row }) => {
        const offense = row.original.offense;
        return <div className="font-medium">{offense.name}</div>;
      },
    },
    {
      accessorKey: "offenseId",
      id: "severity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Severity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const severityLevel = row.original.offense.severityLevel;
        return (
          <span
            className={`px-2 py-1 text-sm rounded-full ${getSeverityColor(severityLevel)}`}
          >
            {getSeverityLabel(severityLevel)}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Date
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
      id: "status",
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
        const ackStatus = getAckStatus(row.original);
        return (
          <span className={`px-2 py-1 text-sm rounded-full ${ackStatus.color}`}>
            {ackStatus.status}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "true") return row.original.acknowledgedBy !== null;
        if (value === "false") return row.original.acknowledgedBy === null;
        return true;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const infraction = row.original;
        return (
          <div className="text-right space-x-2">
            <button
              onClick={() => onAction?.({ type: "view", infraction })}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View
            </button>
            {!infraction.acknowledgedBy && (
              <button
                onClick={() => onAction?.({ type: "acknowledge", infraction })}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
              >
                Acknowledge
              </button>
            )}
            <button
              onClick={() => onAction?.({ type: "edit", infraction })}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
            >
              Edit
            </button>
          </div>
        );
      },
    },
  ];

  return columns;
}

export const columns: ColumnDef<Infraction>[] = [
  {
    accessorKey: "user",
    header: () => <div>Employee</div>,
    cell: ({ row }) => {
      const infraction = row.original;
      if (!infraction.user) {
        return (
          <div>
            <div className="font-medium">Unknown</div>
            <div className="text-sm text-muted-foreground">
              User ID: {infraction.userId}
            </div>
          </div>
        );
      }
      const profile = infraction.user.employeeProfile;
      return (
        <div>
          <div className="font-medium">{getFullName(infraction)}</div>
          <div className="text-sm text-muted-foreground">
            {infraction.user.username}
          </div>
          {profile?.department && (
            <div className="text-xs text-muted-foreground">
              {profile.department.name}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div>Type</div>,
    cell: ({ row }) => {
      const type = row.original.type;
      if (!type) {
        return (
          <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
      }
      return (
        <span
          className="px-2 py-1 text-sm rounded-full"
          style={{
            backgroundColor: `var(--tw-${type.color}-100)`,
            color: `var(--tw-${type.color}-800)`,
          }}
        >
          {type.name}
        </span>
      );
    },
  },
  {
    accessorKey: "offense",
    header: () => <div>Offense</div>,
    cell: ({ row }) => {
      const offense = row.original.offense;
      return <div className="font-medium">{offense.name}</div>;
    },
  },
  {
    accessorKey: "offense.severityLevel",
    header: () => <div>Severity</div>,
    cell: ({ row }) => {
      const severityLevel = row.original.offense.severityLevel;
      return (
        <span
          className={`px-2 py-1 text-sm rounded-full ${getSeverityColor(severityLevel)}`}
        >
          {getSeverityLabel(severityLevel)}
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: () => <div>Date</div>,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    id: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const ackStatus = getAckStatus(row.original);
      return (
        <span className={`px-2 py-1 text-sm rounded-full ${ackStatus.color}`}>
          {ackStatus.status}
        </span>
      );
    },
  },
];
