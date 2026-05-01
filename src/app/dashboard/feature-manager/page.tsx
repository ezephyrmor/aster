"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import { useToast } from "@/lib/toast";

// Mock feature data
const mockFeatures = [
  {
    id: "1",
    name: "Leave Management",
    code: "leave_management",
    description: "Employee leave requests and tracking",
    status: "active",
    category: "HR",
  },
  {
    id: "2",
    name: "Attendance Tracking",
    code: "attendance",
    description: "Clock in/out and attendance records",
    status: "active",
    category: "HR",
  },
  {
    id: "3",
    name: "Schedule Management",
    code: "schedules",
    description: "Work schedules and shifts",
    status: "active",
    category: "Operations",
  },
  {
    id: "4",
    name: "Infraction System",
    code: "infractions",
    description: "Employee discipline tracking",
    status: "inactive",
    category: "HR",
  },
  {
    id: "5",
    name: "Payroll Module",
    code: "payroll",
    description: "Salary calculation and processing",
    status: "beta",
    category: "Finance",
  },
  {
    id: "6",
    name: "Reports Dashboard",
    code: "reports",
    description: "Analytics and reporting module",
    status: "inactive",
    category: "Analytics",
  },
];

export default function FeatureManagerPage() {
  const { addToast } = useToast();
  const [features, setFeatures] = useState(mockFeatures);
  const [editFeature, setEditFeature] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "",
    status: "inactive",
  });

  const handleSave = () => {
    if (editFeature?.id) {
      setFeatures(
        features.map((f) =>
          f.id === editFeature.id ? { ...formData, id: editFeature.id } : f,
        ),
      );
      addToast("Feature updated successfully", "success");
    } else {
      setFeatures([...features, { ...formData, id: String(Date.now()) }]);
      addToast("Feature created successfully", "success");
    }
    setShowModal(false);
    setEditFeature(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      category: "",
      status: "inactive",
    });
  };

  const handleDelete = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
    addToast("Feature deleted successfully", "success");
  };

  const handleToggle = (id: string) => {
    setFeatures(
      features.map((f) =>
        f.id === id
          ? { ...f, status: f.status === "active" ? "inactive" : "active" }
          : f,
      ),
    );
  };

  const openEditModal = (feature: any) => {
    setEditFeature(feature);
    setFormData(feature);
    setShowModal(true);
  };

  return (
    <DashboardLayout
      title="Feature Manager"
      subtitle="Manage system features and permissions"
      icon={<Icons.Settings className="w-6 h-6 text-white" />}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage available system features, status and permissions
            </p>
          </div>
          <button
            onClick={() => {
              setEditFeature(null);
              setFormData({
                name: "",
                code: "",
                description: "",
                category: "",
                status: "inactive",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Icons.Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Feature
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {features.map((feature) => (
                <tr
                  key={feature.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {feature.name}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {feature.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-zinc-600 dark:text-zinc-300">
                    {feature.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {feature.category}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        feature.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : feature.status === "beta"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {feature.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(feature)}
                        className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id)}
                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {editFeature ? "Edit Feature" : "Create Feature"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Feature Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Analytics">Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="beta">Beta</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editFeature ? "Update Feature" : "Create Feature"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
