"use client";

import { Form } from "../form/Form";
import { TextField } from "../form/TextField";
import { Textarea } from "../form/Textarea";
import { Select } from "../form/Select";
import { AsyncSelect } from "../form/AsyncSelect";
import { SubmitButton } from "../form/SubmitButton";
import { CreateBrandSchema, UpdateBrandSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "../ui/button";

type CreateBrandData = z.infer<typeof CreateBrandSchema>;
type UpdateBrandData = z.infer<typeof UpdateBrandSchema>;
type BrandFormData = CreateBrandData | UpdateBrandData;

interface BrandFormProps {
  initialData?: Partial<BrandFormData>;
  onSubmit: (data: BrandFormData) => Promise<void>;
  onCancel: () => void;
}

export default function BrandForm({
  initialData,
  onSubmit,
  onCancel,
}: BrandFormProps) {
  const isEditMode = !!initialData;

  const defaultValues = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    logo: initialData?.logo || "",
    website: initialData?.website || "",
    status: initialData?.status || "active",
    industryId: initialData?.industryId || undefined,
    managerId: initialData?.managerId || undefined,
  };

  const handleFormSubmit = async (data: BrandFormData) => {
    await onSubmit(data);
  };

  return (
    <Form
      schema={isEditMode ? UpdateBrandSchema : CreateBrandSchema}
      defaultValues={defaultValues}
      values={initialData}
      onSubmit={handleFormSubmit}
      className="space-y-6"
    >
      {/* Brand Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Brand Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            name="name"
            label="Brand Name"
            placeholder="e.g., Acme Corporation"
            required
            className="sm:col-span-2"
          />

          <TextField
            name="website"
            label="Website"
            placeholder="https://example.com"
          />

          <TextField
            name="logo"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
          />

          <AsyncSelect
            name="industryId"
            label="Industry"
            endpoint="/api/industries"
            placeholder="Select industry"
          />

          <AsyncSelect
            name="managerId"
            label="Brand Manager"
            endpoint="/api/users"
            placeholder="Select brand manager"
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
            placeholder="Describe the brand and their business..."
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
          {isEditMode ? "Save Changes" : "Create Brand"}
        </SubmitButton>
      </div>
    </Form>
  );
}
