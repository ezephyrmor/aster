"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Form,
  AsyncSelect,
  Select,
  TextField,
  Textarea,
  SubmitButton,
} from "@/components/form";

const LeaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Please select a leave type"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().optional(),
    isPaid: z.enum(["paid", "unpaid"]).default("paid"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type LeaveRequestFormData = z.infer<typeof LeaveRequestSchema>;

interface LeaveType {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

interface LeaveStatus {
  id: number;
  name: string;
  color: string;
}

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  leaveType: LeaveType;
  status: LeaveStatus;
  createdAt: string;
}

interface LeaveCredit {
  totalCredits: number;
  availableCredits: number;
  usedCredits: number;
  creditsByMonth: Array<{
    period: string;
    total: number;
    used: number;
    available: number;
    earnedDate: string;
  }>;
}

export default function LeaveRequestPage() {
  const { user, isLoading } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [credits, setCredits] = useState<LeaveCredit | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      fetchLeaveTypes();
      fetchMyRequests();
      fetchCredits();
    }
  }, [user]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("/api/leaves/types");
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`/api/leaves/requests?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both old array format and new paginated format
        // Demo API returns leaveRequests, regular API returns requests
        const requests = Array.isArray(data)
          ? data
          : data.leaveRequests || data.requests || [];
        setMyRequests(requests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch(`/api/leaves/credits?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      }
    } catch (error) {
      console.error("Error fetching leave credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: LeaveRequestFormData) => {
    setSuccess("");

    try {
      const response = await fetch("/api/leaves/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          leaveTypeId: parseInt(values.leaveTypeId),
          startDate: values.startDate,
          endDate: values.endDate,
          reason: values.reason,
          isPaid: values.isPaid === "paid",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Leave request submitted successfully!");
        fetchMyRequests();
        fetchCredits();
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      } else {
        throw new Error(data.error || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (color: string) => {
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
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout
        title="Leave Request"
        subtitle="Request time off"
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const paymentTypeOptions = [
    { value: "paid", label: "Paid (uses leave credits)" },
    { value: "unpaid", label: "Unpaid (no credits used)" },
  ];

  return (
    <DashboardLayout
      title="Leave Request"
      subtitle="Request time off from work"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
              Submit a Leave Request
            </h2>

            {success && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                {success}
              </div>
            )}

            <Form<LeaveRequestFormData>
              schema={LeaveRequestSchema}
              defaultValues={{
                leaveTypeId: "",
                startDate: "",
                endDate: "",
                reason: "",
                isPaid: "paid",
              }}
              onSubmit={handleSubmit}
            >
              <AsyncSelect
                name="leaveTypeId"
                label="Leave Type"
                endpoint="/api/leaves/types"
                placeholder="Select leave type"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Textarea
                name="reason"
                label="Reason (Optional)"
                placeholder="Provide a reason for your leave request..."
                rows={3}
              />

              <Select
                name="isPaid"
                label="Payment Type"
                options={paymentTypeOptions}
              />

              <SubmitButton className="w-full">
                Submit Leave Request
              </SubmitButton>
            </Form>
          </div>
        </div>

        {/* Leave Credits & History */}
        <div className="space-y-6">
          {/* Credits Summary */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Leave Credits
            </h3>
            {credits && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Available
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {credits.availableCredits}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Total Earned
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {credits.totalCredits}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Used
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {credits.usedCredits}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Recent Requests
            </h3>
            {myRequests.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No leave requests yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {request.leaveType.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status.color)}`}
                      >
                        {request.status.name}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(request.startDate)} -{" "}
                      {formatDate(request.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
