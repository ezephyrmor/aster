"use client";

import { useState, useEffect } from "react";
import { useFormContext as useRhfFormContext } from "react-hook-form";
import { Form } from "./form/Form";
import { TextField } from "./form/TextField";
import { Textarea } from "./form/Textarea";
import { Select } from "./form/Select";
import { AsyncSelect } from "./form/AsyncSelect";
import { SubmitButton } from "./form/SubmitButton";
import { CreateUserSchema, UpdateUserSchema } from "@/lib/validations";
import type { z } from "zod";
import Modal from "./Modal";
import { useToast } from "@/lib/toast";
import { Button } from "./ui/button";

type CreateUserData = z.infer<typeof CreateUserSchema>;
type UpdateUserData = z.infer<typeof UpdateUserSchema>;
type UserFormData = CreateUserData | UpdateUserData;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  userId?: string;
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  userId,
}: UserFormProps) {
  const isEditMode = !!initialData;
  const { addToast } = useToast();

  // Status change modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const STATUS_ID_MAP: Record<string, number> = {
    active: 1,
    probation: 2,
    contract: 3,
    on_leave: 4,
    suspended: 5,
    inactive: 6,
    resigned: 7,
    terminated: 8,
    retired: 9,
    deceased: 10,
  };

  const handleStatusConfirm = async () => {
    if (!userId || !pendingStatus) return;

    setIsStatusUpdating(true);
    try {
      const statusId = STATUS_ID_MAP[pendingStatus];

      const response = await fetch(`/api/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusId,
          reason: statusReason,
          effectiveDate: effectiveDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      addToast("Employee status updated successfully", "success");

      // Refresh page to reload server data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      addToast("Failed to update employee status", "error");
    } finally {
      setIsStatusUpdating(false);
      setTimeout(() => {
        setStatusModalOpen(false);
        setPendingStatus(null);
        setStatusReason("");
        setEffectiveDate(new Date().toISOString().split("T")[0]);
      }, 100);
    }
  };

  const handleStatusCancel = () => {
    setStatusModalOpen(false);
    setPendingStatus(null);
    setStatusReason("");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
  };

  const defaultValues = {
    username: initialData?.username || "",
    password: "",
    role: initialData?.role || "employee",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    middleName: initialData?.middleName || "",
    contactNumber: initialData?.contactNumber || "",
    personalEmail: initialData?.personalEmail || "",
    address: initialData?.address || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    position: initialData?.position || "",
    department: initialData?.department || "",
    hireDate: initialData?.hireDate || "",
    emergencyContactName: initialData?.emergencyContactName || "",
    emergencyContactNumber: initialData?.emergencyContactNumber || "",
    emergencyContactRelation: initialData?.emergencyContactRelation || "",
    status: initialData?.status || "active",
  };

  const handleFormSubmit = async (data: UserFormData) => {
    const submitData = { ...data };

    // For new users, let API auto-generate credentials
    if (!isEditMode) {
      delete (submitData as any).username;
      delete (submitData as any).password;
    }

    await onSubmit(submitData);
  };

  // Watch for status changes
  function StatusChangeWatcher() {
    const { watch, setValue } = useRhfFormContext<UserFormData>();
    const currentStatus = watch("status");
    const originalStatus = initialData?.status;

    useEffect(() => {
      if (
        isEditMode &&
        userId &&
        currentStatus !== originalStatus &&
        currentStatus
      ) {
        // Temporarily revert the value while modal is open
        setValue("status", originalStatus || "active", {
          shouldValidate: false,
        });
        setPendingStatus(currentStatus);
        setStatusModalOpen(true);
      }
    }, [currentStatus, originalStatus, isEditMode, userId, setValue]);

    return null;
  }

  return (
    <>
      <Form
        schema={isEditMode ? UpdateUserSchema : CreateUserSchema}
        defaultValues={defaultValues}
        values={initialData}
        onSubmit={handleFormSubmit}
        className="space-y-8"
      >
        <StatusChangeWatcher />

        {/* Personal Information */}
        <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField
              name="firstName"
              label="First Name"
              placeholder="John"
              required
            />

            <TextField
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              required
            />

            <TextField name="middleName" label="Middle Name" placeholder="M." />

            <TextField name="dateOfBirth" label="Date of Birth" type="date" />

            <TextField
              name="contactNumber"
              label="Contact Number"
              placeholder="+1 (555) 123-4567"
              className="sm:col-span-2"
            />

            <TextField
              name="personalEmail"
              label="Personal Email"
              type="email"
              placeholder="john.doe@example.com"
              className="sm:col-span-2"
            />

            <Textarea
              name="address"
              label="Address"
              placeholder="123 Main St, City, State, ZIP"
              rows={2}
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
            Employment Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AsyncSelect
              name="role"
              label="Role"
              endpoint="/api/roles"
              placeholder="Select role"
              required
            />

            <AsyncSelect
              name="position"
              label="Position"
              endpoint="/api/positions"
              placeholder="Select position"
            />

            <AsyncSelect
              name="department"
              label="Department"
              endpoint="/api/departments"
              placeholder="Select department"
            />

            <TextField name="hireDate" label="Hire Date" type="date" />

            <Select
              name="status"
              label="Employee Status"
              options={[
                { value: "active", label: "Active" },
                { value: "probation", label: "Probation" },
                { value: "contract", label: "Contract" },
                { value: "on_leave", label: "On Leave" },
                { value: "suspended", label: "Suspended" },
                { value: "inactive", label: "Inactive" },
                { value: "resigned", label: "Resigned" },
                { value: "terminated", label: "Terminated" },
                { value: "retired", label: "Retired" },
                { value: "deceased", label: "Deceased" },
              ]}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField
              name="emergencyContactName"
              label="Contact Name"
              placeholder="Jane Doe"
            />

            <TextField
              name="emergencyContactRelation"
              label="Relation"
              placeholder="Spouse"
            />

            <TextField
              name="emergencyContactNumber"
              label="Contact Number"
              placeholder="+1 (555) 987-6543"
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <SubmitButton>Save</SubmitButton>
        </div>
      </Form>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={handleStatusCancel}
        title="Change Employee Status"
        description="Please provide a reason for this status change."
        variant="warning"
        size="md"
        isLoading={isStatusUpdating}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={handleStatusCancel}
              disabled={isStatusUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStatusConfirm}
              disabled={isStatusUpdating || !statusReason.trim()}
            >
              Confirm Change
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You are about to change employee status from{" "}
              <strong>{initialData?.status}</strong> to{" "}
              <strong>{pendingStatus}</strong>.
            </p>
          </div>

          <div>
            <label
              htmlFor="effectiveDate"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1"
            >
              Effective Date
            </label>
            <input
              type="date"
              id="effectiveDate"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="statusReason"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1"
            >
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <textarea
              id="statusReason"
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for this status change..."
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100"
              required
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
