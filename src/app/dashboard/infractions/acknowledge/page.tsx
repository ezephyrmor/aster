"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Infraction {
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
}

export default function AcknowledgeInfractionsPage() {
  const router = useRouter();
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);
  const [selectedComment, setSelectedComment] = useState<{
    [key: number]: string;
  }>({});

  const fetchPendingInfractions = useCallback(async () => {
    try {
      const response = await fetch("/api/infractions?acknowledged=false");
      if (response.ok) {
        const data = await response.json();
        setInfractions(data);
      }
    } catch (error) {
      console.error("Error fetching pending infractions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingInfractions();
  }, [fetchPendingInfractions]);

  const getFullName = (infraction: Infraction) => {
    if (infraction.user.employeeProfile) {
      return `${infraction.user.employeeProfile.firstName} ${infraction.user.employeeProfile.lastName}`;
    }
    return infraction.user.username;
  };

  const getSeverityLabel = (level: number) => {
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
  };

  const getSeverityColor = (level: number) => {
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
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAcknowledge = async (id: number) => {
    if (!confirm("Are you sure you want to acknowledge this infraction?")) {
      return;
    }

    setAcknowledgingId(id);

    try {
      const response = await fetch(`/api/infractions/${id}/acknowledge`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acknowledgedBy: 1, // Admin user ID
          comment: selectedComment[id] || null,
        }),
      });

      if (response.ok) {
        // Remove from list
        setInfractions(infractions.filter((i) => i.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to acknowledge infraction");
      }
    } catch (error) {
      console.error("Error acknowledging infraction:", error);
      alert("Failed to acknowledge infraction");
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard/infractions");
  };

  return (
    <DashboardLayout
      title="Acknowledge Infractions"
      subtitle="Review and acknowledge pending employee infractions"
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : infractions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No pending infractions to acknowledge.
          </p>
          <button
            onClick={handleSkip}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Infractions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {infractions.map((infraction) => (
            <div
              key={infraction.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {getFullName(infraction)}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(infraction.offense.severityLevel)}`}
                    >
                      {getSeverityLabel(infraction.offense.severityLevel)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-medium">{infraction.type.name}</span>{" "}
                    - {infraction.offense.name}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(infraction.date)}
                  </div>

                  {infraction.user.employeeProfile?.department && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium">Department:</span>{" "}
                      {infraction.user.employeeProfile.department.name}
                    </div>
                  )}

                  {infraction.details && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Details:</span>{" "}
                        {infraction.details}
                      </p>
                    </div>
                  )}

                  {infraction.comment && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Comment:</span>{" "}
                        {infraction.comment}
                      </p>
                    </div>
                  )}

                  {/* Comment input for acknowledgment */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Add acknowledgment comment (optional)
                    </label>
                    <textarea
                      value={selectedComment[infraction.id] || ""}
                      onChange={(e) =>
                        setSelectedComment({
                          ...selectedComment,
                          [infraction.id]: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Add notes about this acknowledgment..."
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => handleAcknowledge(infraction.id)}
                    disabled={acknowledgingId === infraction.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acknowledgingId === infraction.id
                      ? "Acknowledging..."
                      : "Acknowledge"}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/infractions/${infraction.id}`)
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors"
            >
              Back to Infractions
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
