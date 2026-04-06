"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface Employee {
  id: number;
  username: string;
  employeeProfile: {
    firstName: string;
    lastName: string;
    department: { name: string } | null;
  } | null;
}

interface InfractionType {
  id: number;
  name: string;
  color: string;
}

interface InfractionOffense {
  id: number;
  name: string;
  severityLevel: number;
  typeId: number;
  description: string | null;
}

interface Infraction {
  id: number;
  userId: number;
  offenseId: number;
  typeId: number;
  date: string;
  details: string | null;
}

export default function EditInfractionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<InfractionType[]>([]);
  const [offenses, setOffenses] = useState<InfractionOffense[]>([]);
  const [filteredOffenses, setFilteredOffenses] = useState<InfractionOffense[]>(
    [],
  );

  // Employee search
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // Form data
  const [formData, setFormData] = useState<Infraction>({
    id: 0,
    userId: 0,
    offenseId: 0,
    typeId: 0,
    date: "",
    details: null,
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

  const fetchTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/infraction-types");
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  }, []);

  const fetchOffenses = useCallback(async () => {
    try {
      const response = await fetch("/api/infraction-offenses");
      if (response.ok) {
        const data = await response.json();
        setOffenses(data);
      }
    } catch (error) {
      console.error("Error fetching offenses:", error);
    }
  }, []);

  const fetchInfraction = useCallback(async () => {
    try {
      const response = await fetch(`/api/infractions/${params.id}`);
      if (response.ok) {
        const data: Infraction = await response.json();
        setFormData(data);

        // Find and set the selected employee
        const emp = employees.find((e) => e.id === data.userId);
        if (emp) {
          setSelectedEmployee(emp);
          setEmployeeSearch("");
        }
      } else {
        alert("Failed to load infraction");
        router.push("/dashboard/infractions");
      }
    } catch (error) {
      console.error("Error fetching infraction:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router, employees]);

  useEffect(() => {
    fetchEmployees();
    fetchTypes();
    fetchOffenses();
  }, [fetchEmployees, fetchTypes, fetchOffenses]);

  // Fetch infraction after employees are loaded
  useEffect(() => {
    if (employees.length > 0) {
      fetchInfraction();
    }
  }, [employees.length, fetchInfraction]);

  // Filter offenses when type changes
  useEffect(() => {
    if (formData.typeId) {
      setFilteredOffenses(offenses.filter((o) => o.typeId === formData.typeId));
    } else {
      setFilteredOffenses([]);
    }
  }, [formData.typeId, offenses]);

  // Filter employees based on search
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = employeeSearch.toLowerCase();
    const fullName =
      `${emp.employeeProfile?.firstName || ""} ${emp.employeeProfile?.lastName || ""} ${emp.username}`.toLowerCase();
    return fullName.includes(searchLower);
  });

  const getFullName = (emp: Employee) => {
    if (emp.employeeProfile) {
      return `${emp.employeeProfile.firstName} ${emp.employeeProfile.lastName}`;
    }
    return emp.username;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.typeId || !formData.offenseId) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/infractions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          typeId: formData.typeId,
          offenseId: formData.offenseId,
          date: formData.date,
          details: formData.details,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/infractions/${params.id}`);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update infraction");
      }
    } catch (error) {
      console.error("Error updating infraction:", error);
      alert("Failed to update infraction");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Infraction" subtitle="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Infraction"
      subtitle={`Infraction #${formData.id}`}
    >
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={
                  selectedEmployee
                    ? getFullName(selectedEmployee)
                    : employeeSearch
                }
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setShowEmployeeDropdown(true);
                  setSelectedEmployee(null);
                  setFormData({ ...formData, userId: 0 });
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
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setEmployeeSearch("");
                        setFormData({ ...formData, userId: emp.id });
                        setShowEmployeeDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer"
                    >
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {getFullName(emp)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {emp.username}
                        {emp.employeeProfile?.department && (
                          <span> - {emp.employeeProfile.department.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedEmployee && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Selected: {getFullName(selectedEmployee)}
              </div>
            )}
          </div>

          {/* Infraction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Infraction Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.typeId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  typeId: parseInt(e.target.value),
                  offenseId: 0,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Select type...</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Offense */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Offense <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.offenseId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  offenseId: parseInt(e.target.value),
                })
              }
              disabled={!formData.typeId}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select offense...</option>
              {filteredOffenses.map((offense) => (
                <option key={offense.id} value={offense.id}>
                  {offense.name} -{" "}
                  {["", "Minor", "Major", "Severe"][offense.severityLevel]}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={
                formData.date
                  ? new Date(formData.date).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Details
            </label>
            <textarea
              value={formData.details || ""}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              rows={4}
              placeholder="Describe the incident in detail..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/dashboard/infractions/${params.id}`}
              className="flex-1 py-2 px-4 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
