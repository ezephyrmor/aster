"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface MyInfraction {
  id: number;
  offenseId: number;
  typeId: number;
  date: string;
  details: string | null;
  comment: string | null;
  acknowledgedBy: number | null;
  acknowledgedAt: string | null;
  createdAt: string;
  updatedAt: string;
  offense: {
    id: number;
    name: string;
    severityLevel: number;
    description: string | null;
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
    description: string | null;
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

export default function ViewMyInfractionPage() {
  const params = useParams();
  const router = useRouter();
  const [infraction, setInfraction] = useState<MyInfraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfraction = useCallback(async () => {
    try {
      const response = await fetch(`/api/my-infractions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInfraction(data);
      } else if (response.status === 401) {
        window.location.href = "/login";
      } else if (response.status === 404) {
        setError("Infraction not found");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to fetch infraction");
      }
    } catch (err) {
      setError("Failed to fetch infraction");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchInfraction();
  }, [fetchInfraction]);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFullName = (person: {
    employeeProfile: { firstName: string; lastName: string } | null;
    username: string;
  }) => {
    if (person.employeeProfile) {
      return `${person.employeeProfile.firstName} ${person.employeeProfile.lastName}`;
    }
    return person.username;
  };

  if (loading) {
    return (
      <DashboardLayout title="View Infraction" subtitle="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !infraction) {
    return (
      <DashboardLayout title="View Infraction" subtitle="Error">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || "Infraction not found"}
          </p>
          <Link
            href="/dashboard/my-infractions"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to My Infractions
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="View Infraction"
      subtitle={`Infraction #${infraction.id}`}
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/my-infractions"
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors"
          >
            Back to List
          </Link>
        </div>

        {/* Infraction Details */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Infraction Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {infraction.type.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Offense
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {infraction.offense.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Severity
              </p>
              <span
                className={`inline-block px-2 py-1 text-sm rounded-full ${getSeverityColor(infraction.offense.severityLevel)}`}
              >
                {getSeverityLabel(infraction.offense.severityLevel)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {new Date(infraction.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {infraction.details && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Details
              </p>
              <div className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {infraction.details}
                </p>
              </div>
            </div>
          )}

          {infraction.comment && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                HR Comment
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {infraction.comment}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acknowledgment Status
              </p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-sm rounded-full ${
                  infraction.acknowledgedBy
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {infraction.acknowledgedBy ? "Acknowledged" : "Pending"}
              </span>
            </div>
            {infraction.acknowledgedBy && infraction.ackUser && (
              <>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Acknowledged By
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {getFullName(infraction.ackUser)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Acknowledged At
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {formatDate(infraction.acknowledgedAt!)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Record Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created At
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {formatDate(infraction.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last Updated
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {formatDate(infraction.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
