"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/tables/ServerSideDataTable";
import {
  useScheduleColumns,
  WorkSchedule,
  ScheduleAction,
} from "@/components/tables/columns/ScheduleColumns";
import { PaginationState, SortingState } from "@tanstack/react-table";

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SchedulesResponse {
  schedules: WorkSchedule[];
  pagination: Pagination;
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

// Helper function to get full name from employee data
const getFullName = (
  employee: { firstName: string; lastName: string } | null,
  username: string,
) => {
  if (employee) {
    return `${employee.firstName} ${employee.lastName}`;
  }
  return username;
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(
    null,
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchName]);

  // TanStack Table pagination state
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // TanStack Table sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form data state
  const [formData, setFormData] = useState({
    userId: "",
    dayOfWeek: [1], // Array of selected days
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: "60",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
  });

  // Sync TanStack Table pagination with our pagination state
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: tablePagination.pageIndex + 1,
      limit: tablePagination.pageSize,
    }));
  }, [tablePagination]);

  // Map sorting column IDs to API field names
  // Note: Prisma orderBy doesn't support deeply nested relations like user.employeeProfile.firstName
  // We use simpler fields that Prisma can handle
  const getSortByField = (columnId: string): string => {
    const fieldMap: Record<string, string> = {
      user: "userId", // Sort by user ID since nested name sorting isn't supported
      dayOfWeek: "dayOfWeek",
      breakMinutes: "breakMinutes",
      effectiveFrom: "effectiveFrom",
    };
    return fieldMap[columnId] || columnId;
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = employeeSearch.toLowerCase();
    const fullName = getFullName(
      emp.employeeProfile,
      emp.username,
    ).toLowerCase();
    return (
      fullName.includes(searchLower) ||
      emp.username.toLowerCase().includes(searchLower)
    );
  });

  const selectedEmployee = employees.find(
    (emp) => emp.id.toString() === formData.userId,
  );

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight schedules

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);

      // Add sorting parameters
      if (sorting.length > 0) {
        const sort = sorting[0];
        const sortBy = getSortByField(sort.id);
        const sortOrder = sort.desc ? "desc" : "asc";
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
      }

      const response = await fetch(`/api/schedules?${params.toString()}`);
      if (response.ok) {
        const data: SchedulesResponse = await response.json();
        setSchedules(data.schedules);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, sorting]);

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
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setTablePagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, departmentFilter, teamFilter]);

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

  // Update sorting state when TanStack Table sorting changes
  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((old) => {
        const newSorting =
          typeof updater === "function" ? updater(old) : updater;
        return newSorting;
      });
    },
    [],
  );

  const openModal = (schedule?: WorkSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        userId: schedule.userId.toString(),
        dayOfWeek: [schedule.dayOfWeek],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        breakMinutes: schedule.breakMinutes.toString(),
        effectiveFrom: schedule.effectiveFrom.split("T")[0],
        effectiveTo: schedule.effectiveTo
          ? schedule.effectiveTo.split("T")[0]
          : "",
      });
      setEmployeeSearch(
        getFullName(schedule.user.employeeProfile, schedule.user.username),
      );
    } else {
      setEditingSchedule(null);
      setFormData({
        userId: "",
        dayOfWeek: [],
        startTime: "09:00",
        endTime: "18:00",
        breakMinutes: "60",
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
      });
      setEmployeeSearch("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setEmployeeSearch("");
    setShowEmployeeDropdown(false);
    setFormErrors({});
    setGlobalError(null);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setFormData({ ...formData, userId: employee.id.toString() });
    setEmployeeSearch(getFullName(employee.employeeProfile, employee.username));
    setShowEmployeeDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setFormErrors({});

    const errors: Record<string, string> = {};

    if (!formData.userId) {
      errors.userId = "Please select an employee";
    }

    if (formData.dayOfWeek.length === 0) {
      errors.dayOfWeek = "Please select at least one day";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const promises = formData.dayOfWeek.map((day) => {
        const url = editingSchedule
          ? `/api/schedules/${editingSchedule.id}`
          : "/api/schedules";
        const method = editingSchedule ? "PUT" : "POST";

        return fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            userId: parseInt(formData.userId),
            dayOfWeek: day,
            breakMinutes: parseInt(formData.breakMinutes),
          }),
        });
      });

      const results = await Promise.all(promises);
      const hasError = results.some((r) => !r.ok);

      if (!hasError) {
        fetchSchedules();
        closeModal();
      } else {
        const errorResult = results.find((r) => !r.ok);
        const data = await errorResult?.json();
        setGlobalError(data?.error || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      setGlobalError("Failed to save schedule");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSchedules();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule");
    }
  };

  // Handle schedule actions from the table
  const handleScheduleAction = useCallback((action: ScheduleAction) => {
    switch (action.type) {
      case "edit":
        openModal(action.schedule);
        break;
      case "delete":
        handleDelete(action.schedule.id);
        break;
    }
  }, []);

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
      onChange: setDepartmentFilter,
    },
    {
      id: "team",
      label: "Team",
      type: "select",
      options: teams.map((team) => ({ value: team, label: team })),
      value: teamFilter,
      onChange: setTeamFilter,
    },
  ];

  // Create the Add Schedule button
  const searchAction = (
    <button
      onClick={() => openModal()}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
    >
      + Add Schedule
    </button>
  );

  return (
    <DashboardLayout
      title="Schedules"
      subtitle="Manage employee work schedules"
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    >
      <ServerSideDataTable
        columns={columns}
        data={schedules}
        totalCount={pagination.total}
        isLoading={loading}
        error={error}
        searchKey="name"
        searchPlaceholder="Search by employee name..."
        searchValue={searchName}
        onSearchChange={setSearchName}
        searchAction={searchAction}
        filters={filters}
        pagination={tablePagination}
        onPaginationChange={setTablePagination}
        sorting={sorting}
        onSortingChange={handleSortingChange}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h3>

            {globalError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Employee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowEmployeeDropdown(true);
                      setFormData({ ...formData, userId: "" });
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    placeholder="Search employee..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  {showEmployeeDropdown && filteredEmployees.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg">
                      {filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() => handleEmployeeSelect(emp)}
                          className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer"
                        >
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {getFullName(emp.employeeProfile, emp.username)}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {emp.username}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.userId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.userId}
                  </p>
                )}
                {selectedEmployee && (
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Selected:{" "}
                    {getFullName(
                      selectedEmployee.employeeProfile,
                      selectedEmployee.username,
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Working Days
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = formData.dayOfWeek.includes(day.value);
                    return (
                      <label
                        key={day.value}
                        className={`flex items-center justify-center px-2 py-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-400"
                            : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                dayOfWeek: [...formData.dayOfWeek, day.value],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                dayOfWeek: formData.dayOfWeek.filter(
                                  (d) => d !== day.value,
                                ),
                              });
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-xs font-medium">
                          {day.label.slice(0, 3)}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Selected:{" "}
                  {formData.dayOfWeek.length > 0
                    ? formData.dayOfWeek
                        .map(
                          (d) =>
                            DAYS_OF_WEEK.find((day) => day.value === d)?.label,
                        )
                        .join(", ")
                    : "None"}
                </p>
                {formErrors.dayOfWeek && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.dayOfWeek}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg text-center">
                Total working hours:{" "}
                {calculateDuration(formData.startTime, formData.endTime)}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Break (minutes)
                </label>
                <input
                  type="number"
                  value={formData.breakMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, breakMinutes: e.target.value })
                  }
                  min="0"
                  max="240"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        effectiveFrom: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Effective To (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveTo}
                    onChange={(e) =>
                      setFormData({ ...formData, effectiveTo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 px-4 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingSchedule ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
