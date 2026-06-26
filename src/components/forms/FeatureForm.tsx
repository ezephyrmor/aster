"use client";

import { useEffect } from "react";
import { Form } from "../form/Form";
import { TextField } from "../form/TextField";
import { Textarea } from "../form/Textarea";
import { Select } from "../form/Select";
import { SubmitButton } from "../form/SubmitButton";
import { CreateFeatureSchema, UpdateFeatureSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "../ui/button";

export type CreateFeatureData = z.infer<typeof CreateFeatureSchema>;
export type UpdateFeatureData = z.infer<typeof UpdateFeatureSchema>;
export type FeatureFormData = CreateFeatureData | UpdateFeatureData;

interface FeatureFormProps {
  initialData?: Partial<FeatureFormData>;
  onSubmit: (data: FeatureFormData) => Promise<void>;
  onCancel: () => void;
}

export default function FeatureForm({
  initialData,
  onSubmit,
  onCancel,
}: FeatureFormProps) {
  const isEditMode = !!initialData;

  const defaultValues = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    domain: initialData?.domain || "",
    kind: initialData?.kind || "page",
    httpMethod: initialData?.httpMethod || "",
    path: initialData?.path || "",
  };

  return (
    <Form
      schema={isEditMode ? UpdateFeatureSchema : CreateFeatureSchema}
      defaultValues={defaultValues}
      values={initialData}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {/* Feature Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Feature Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            name="name"
            label="Feature Name"
            placeholder="Leave Management"
            required
          />

          <TextField
            name="code"
            label="Feature Code"
            placeholder="leave_management"
            required
          />

          <Textarea
            name="description"
            label="Description"
            placeholder="Employee leave requests and tracking"
            rows={2}
            className="sm:col-span-2"
          />

          <Select
            name="domain"
            label="Domain"
            placeholder="Select domain"
            options={[
              { value: "HR", label: "HR" },
              { value: "Finance", label: "Finance" },
              { value: "Operations", label: "Operations" },
              { value: "Analytics", label: "Analytics" },
              { value: "System", label: "System" },
            ]}
            required
          />

          <Select
            name="kind"
            label="Feature Kind"
            placeholder="Select kind"
            options={[
              { value: "page", label: "Page" },
              { value: "action", label: "Action" },
              { value: "api", label: "API" },
            ]}
            required
          />

          <TextField
            name="path"
            label="Path"
            placeholder="/dashboard/leave-management"
            required
          />

          <Select
            name="httpMethod"
            label="HTTP Method"
            placeholder="Select method (for API endpoints)"
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "DELETE", label: "DELETE" },
              { value: "PATCH", label: "PATCH" },
            ]}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton>
          {isEditMode ? "Update Feature" : "Create Feature"}
        </SubmitButton>
      </div>
    </Form>
  );
}
