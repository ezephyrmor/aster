"use client";

import { Form } from "../form/Form";
import { TextField } from "../form/TextField";
import { Textarea } from "../form/Textarea";
import { Select } from "../form/Select";
import { AsyncSelect } from "../form/AsyncSelect";
import { SubmitButton } from "../form/SubmitButton";
import { CreateTeamSchema, UpdateTeamSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "../ui/button";

type CreateTeamData = z.infer<typeof CreateTeamSchema>;
type UpdateTeamData = z.infer<typeof UpdateTeamSchema>;
type TeamFormData = CreateTeamData | UpdateTeamData;

interface TeamFormProps {
  initialData?: Partial<TeamFormData>;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TeamForm({
  initialData,
  onSubmit,
  onCancel,
}: TeamFormProps) {
  const isEditMode = !!initialData;

  const defaultValues = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    brandId: initialData?.brandId || undefined,
    managerId: initialData?.managerId || undefined,
    status: initialData?.status || "active",
  };

  const handleFormSubmit = async (data: TeamFormData) => {
    await onSubmit(data);
  };

  return (
    <Form
      schema={isEditMode ? UpdateTeamSchema : CreateTeamSchema}
      defaultValues={defaultValues}
      values={initialData}
      onSubmit={handleFormSubmit}
      className="space-y-6"
    >
      {/* Team Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Team Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            name="name"
            label="Team Name"
            placeholder="e.g., Engineering Department"
            required
            className="sm:col-span-2"
          />

          <AsyncSelect
            name="brandId"
            label="Brand"
            endpoint="/api/brands"
            placeholder="Select brand"
          />

          <AsyncSelect
            name="managerId"
            label="Team Manager"
            endpoint="/api/users"
            placeholder="Select team manager"
          />

          <Select
            name="status"
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "archived", label: "Archived" },
            ]}
          />

          <Textarea
            name="description"
            label="Description"
            placeholder="Describe the team and responsibilities..."
            rows={4}
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
          {isEditMode ? "Save Changes" : "Create Team"}
        </SubmitButton>
      </div>
    </Form>
  );
}
