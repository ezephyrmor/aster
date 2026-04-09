"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/ServerSideDataTable";
import {
  useScheduleColumns,
  WorkSchedule,
  ScheduleAction,
} from "@/components/ScheduleColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface Employee {
  id: number;
  username: string;
  employeeProfile: {
    firstName: string;
    lastName: string;
    department?: string | null;
    position?: string | null;
  } | null;
  teams?: { name: string }[];
}

interface ScheduleListProps {
  onAddClick?: () => void;
  onEdit?: (schedule: WorkSchedule) => void;
  onDelete?: (scheduleId: number) => void;
}

export default function ScheduleList({
  onAddClick,
  onEdit,
  onDelete,
}: ScheduleListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  const {
    data: schedules,
    loading,
    error,
    pagination,
    tablePagination,
    setTablePagination,
    sorting,
    setSorting,
    search,
    setSearch,
    setExtraParams,
    refresh,
  } = useServerSideDataTable<WorkSchedule>({
    apiEndpoint: "/api/schedules",
    defaultSortBy: "effectiveFrom",
    defaultSortOrder: "desc",
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/users?limit=1000&sortBy=id&sortOrder=asc",
      );
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : data.users || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Get unique departments from employees
  const departments = Array.from(
    new Set(
      employees
        .map((emp) => emp.employeeProfile?.department)
        .filter((d): d is string => !!d),
    ),
  ).sort();

  // Get unique teams from employees
  const teams = Array.from(
    new Set(
      employees
        .flatMap((emp) => emp.teams?.map((t) => t.name) || [])
        .filter((t): t is string => !!t),
    ),
  ).sort();

  // Handle schedule actions from the table
  const handleScheduleAction = useCallback(
    (action: ScheduleAction) => {
      switch (action.type) {
        case "edit":
          if (onEdit) onEdit(action.schedule);
          break;
        case "delete":
          if (onDelete) onDelete(action.schedule.id);
          break;
      }
    },
    [onEdit, onDelete],
  );

  // Get columns with action handlers
  const columns = useScheduleColumns({ onAction: handleScheduleAction });

  // Build filters configuration
  const filters: FilterConfig[] = [
    {
      id: "department",
      label: "Department",
      type: "select",
      options: departments.map((dept) => ({ value: dept, label: dept })),
      value: departmentFilter,
      onChange: (value: string) => {
        setDepartmentFilter(value);
        setExtraParams((prev) => ({ ...prev, department: value }));
      },
    },
    {
      id: "team",
      label: "Team",
      type: "select",
      options: teams.map((team) => ({ value: team, label: team })),
      value: teamFilter,
      onChange: (value: string) => {
        setTeamFilter(value);
        setExtraParams((prev) => ({ ...prev, team: value }));
      },
    },
  ];

  // Create the Add Schedule button
  const searchAction = onAddClick ? (
    <button
      onClick={onAddClick}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
    >
      + Add Schedule
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={schedules}
      totalCount={pagination.total}
      isLoading={loading}
      error={error}
      searchKey="name"
      searchPlaceholder="Search by employee name..."
      searchValue={search}
      onSearchChange={setSearch}
      searchAction={searchAction}
      filters={filters}
      pagination={tablePagination}
      onPaginationChange={setTablePagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
