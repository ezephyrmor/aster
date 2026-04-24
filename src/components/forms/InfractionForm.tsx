"use client";

import { Form } from "../form/Form";
import { TextField } from "../form/TextField";
import { Textarea } from "../form/Textarea";
import { Select } from "../form/Select";
import { AsyncSelect } from "../form/AsyncSelect";
import { SubmitButton } from "../form/SubmitButton";
import {
  CreateInfractionSchema,
  UpdateInfractionSchema,
} from "@/lib/validations";
import type { z } from "zod";
import { Button } from "../ui/button";

type CreateInfractionData = z.infer<typeof CreateInfractionSchema>;
type UpdateInfractionData = z.infer<typeof UpdateInfractionSchema>;
type InfractionFormData = CreateInfractionData | UpdateInfractionData;

interface InfractionFormProps {
  initialData?: Partial<InfractionFormData>;
  onSubmit: (data: InfractionFormData) => Promise<void>;
  onCancel: () => void;
}

export default function InfractionForm({
  initialData,
  onSubmit,
  onCancel,
}: InfractionFormProps) {
  const isEditMode = !!initialData;

  const defaultValues = {
    userId: initialData?.userId || undefined,
    typeId: initialData?.typeId || undefined,
    offenseId: initialData?.offenseId || undefined,
    date: initialData?.date || new Date().toISOString().split("T")[0],
    reportedById: initialData?.reportedById || undefined,
    details: initialData?.details || "",
    comment: initialData?.comment || "",
    status: initialData?.status || "pending",
    severity: initialData?.severity || "medium",
  };

  const handleFormSubmit = async (data: InfractionFormData) => {
    await onSubmit(data);
  };

  return (
    <Form
      schema={isEditMode ? UpdateInfractionSchema : CreateInfractionSchema}
      defaultValues={defaultValues}
      values={initialData}
      onSubmit={handleFormSubmit}
      className="space-y-6"
    >
      {/* Infraction Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Infraction Details
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <AsyncSelect
            name="userId"
            label="Employee"
            endpoint="/api/users"
            placeholder="Select employee"
            required
          />

          <AsyncSelect
            name="reportedById"
            label="Reported By"
            endpoint="/api/users"
            placeholder="Select reporter"
            required
          />

          <AsyncSelect
            name="typeId"
            label="Infraction Type"
            endpoint="/api/infraction-types"
            placeholder="Select type"
            required
          />

          <AsyncSelect
            name="offenseId"
            label="Offense"
            endpoint="/api/infraction-offenses"
            placeholder="Select offense"
            required
          />

          <TextField name="date" label="Incident Date" type="date" required />

          <Select
            name="severity"
            label="Severity"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
          />

          <Select
            name="status"
            label="Status"
            options={[
              { value: "pending", label: "Pending" },
              { value: "investigating", label: "Investigating" },
              { value: "resolved", label: "Resolved" },
              { value: "dismissed", label: "Dismissed" },
            ]}
          />

          <Textarea
            name="details"
            label="Description"
            placeholder="Describe the incident..."
            rows={4}
            className="sm:col-span-2"
            required
          />

          <Textarea
            name="comment"
            label="Internal Notes"
            placeholder="Add any additional notes or comments..."
            rows={3}
            className="sm:col-span-2"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton>
          {isEditMode ? "Save Changes" : "Create Infraction"}
        </SubmitButton>
      </div>
    </Form>
  );
}
