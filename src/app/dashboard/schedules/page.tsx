"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Employee {
  id: number;
  username: string;
  employeeProfile: {
    firstName: string;
    lastName: string;
  } | null;
}

interface WorkSchedule {
  id: number;
  userId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  user: Employee;
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
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(
    null,
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    dayOfWeek: [1], // Array of selected days
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: "60",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
  });

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

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetch("/api/schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      // Fetch all users sorted by ID ascending (so admin appears first)
      const response = await fetch(
        "/api/users?limit=1000&sortBy=id&sortOrder=asc",
      );
      if (response.ok) {
        const data = await response.json();
        // Handle paginated response format
        setEmployees(Array.isArray(data) ? data : data.users || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchEmployees();
  }, [fetchSchedules, fetchEmployees]);

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
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setFormData({ ...formData, userId: employee.id.toString() });
    setEmployeeSearch(getFullName(employee.employeeProfile, employee.username));
    setShowEmployeeDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) {
      alert("Please select an employee");
      return;
    }

    if (formData.dayOfWeek.length === 0) {
      alert("Please select at least one day");
      return;
    }

    try {
      // Create schedules for each selected day
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
        alert(data?.error || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule");
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

  const getDayName = (day: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === day)?.label || "Unknown";
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <DashboardLayout
      title="Work Schedules"
      subtitle="Manage employee work schedules"
    >
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Add Schedule
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No schedules found. Click "Add Schedule" to create one.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Break
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
              {schedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getFullName(
                        schedule.user.employeeProfile,
                        schedule.user.username,
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {schedule.user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-sm rounded-full">
                      {getDayName(schedule.dayOfWeek)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {schedule.breakMinutes} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(schedule.effectiveFrom).toLocaleDateString()}
                    </div>
                    {schedule.effectiveTo && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        To:{" "}
                        {new Date(schedule.effectiveTo).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(schedule)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h3>

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
