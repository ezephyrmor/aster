"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema, UpdateUserSchema } from "@/lib/validations";
import type { z } from "zod";
import LookupDropdown from "./LookupDropdown";

type CreateUserData = z.infer<typeof CreateUserSchema>;
type UpdateUserData = z.infer<typeof UpdateUserSchema>;
type UserFormData = CreateUserData | UpdateUserData;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(isEditMode ? UpdateUserSchema : CreateUserSchema),
    defaultValues: {
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
    },
    mode: "onBlur",
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  // Auto-generate username preview
  const generateUsernamePreview = () => {
    if (!firstName || !lastName) return "";
    const lastNameInitial = lastName.charAt(0).toLowerCase();
    const firstNameLower = firstName.toLowerCase();
    return `${lastNameInitial}${firstNameLower}`;
  };

  const onFormSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      const submitData = { ...data };

      // For new users, let API auto-generate credentials
      if (!isEditMode) {
        delete (submitData as any).username;
        delete (submitData as any).password;
      }

      await onSubmit(submitData);
    } finally {
      setIsLoading(false);
    }
  };

  // Error message helper
  const fieldError = (fieldName: keyof UserFormData) => {
    return errors[fieldName]?.message as string | undefined;
  };

  // Input class helper
  const inputClass = (fieldName: keyof UserFormData) => {
    return `mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100 ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : ""
    }`;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Account Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={
                isEditMode
                  ? initialData?.username || ""
                  : generateUsernamePreview()
              }
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 shadow-sm sm:text-sm bg-gray-100 dark:bg-zinc-700 cursor-not-allowed"
              placeholder={isEditMode ? "Locked" : "Auto-generated"}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {isEditMode
                ? "Username cannot be changed"
                : "Auto-generated from name (e.g., djoe-a7k9)"}
            </p>
          </div>

          {!isEditMode && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                type="text"
                id="password"
                value="Auto-generated"
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 shadow-sm sm:text-sm bg-gray-50 dark:bg-zinc-700"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                A secure password will be generated automatically
              </p>
            </div>
          )}

          {isEditMode && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                className={inputClass("password")}
                placeholder="••••••••"
              />
              {fieldError("password") && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldError("password")}
                </p>
              )}
            </div>
          )}

          <LookupDropdown
            endpoint="/api/roles"
            name="role"
            label="Role"
            register={register}
            error={fieldError("role")}
            defaultValue={initialData?.role || ""}
            placeholder="Select role"
            required={true}
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              className={inputClass("firstName")}
              placeholder="John"
            />
            {fieldError("firstName") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("firstName")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              {...register("lastName")}
              className={inputClass("lastName")}
              placeholder="Doe"
            />
            {fieldError("lastName") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("lastName")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="middleName"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Middle Name
            </label>
            <input
              type="text"
              id="middleName"
              {...register("middleName")}
              className={inputClass("middleName")}
              placeholder="M."
            />
            {fieldError("middleName") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("middleName")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register("dateOfBirth")}
              className={inputClass("dateOfBirth")}
            />
            {fieldError("dateOfBirth") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("dateOfBirth")}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contactNumber"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              {...register("contactNumber")}
              className={inputClass("contactNumber")}
              placeholder="+1 (555) 123-4567"
            />
            {fieldError("contactNumber") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("contactNumber")}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="personalEmail"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Personal Email
            </label>
            <input
              type="email"
              id="personalEmail"
              {...register("personalEmail")}
              className={inputClass("personalEmail")}
              placeholder="john.doe@example.com"
            />
            {fieldError("personalEmail") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("personalEmail")}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              {...register("address")}
              className={inputClass("address")}
              placeholder="123 Main St, City, State, ZIP"
            />
            {fieldError("address") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("address")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Employment Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <LookupDropdown
            endpoint="/api/positions"
            name="position"
            label="Position"
            register={register}
            error={fieldError("position")}
            defaultValue={initialData?.position || ""}
            placeholder="Select position"
          />

          <LookupDropdown
            endpoint="/api/departments"
            name="department"
            label="Department"
            register={register}
            error={fieldError("department")}
            defaultValue={initialData?.department || ""}
            placeholder="Select department"
          />

          <div>
            <label
              htmlFor="hireDate"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Hire Date
            </label>
            <input
              type="date"
              id="hireDate"
              {...register("hireDate")}
              className={inputClass("hireDate")}
            />
            {fieldError("hireDate") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("hireDate")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="emergencyContactName"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Contact Name
            </label>
            <input
              type="text"
              id="emergencyContactName"
              {...register("emergencyContactName")}
              className={inputClass("emergencyContactName")}
              placeholder="Jane Doe"
            />
            {fieldError("emergencyContactName") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("emergencyContactName")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="emergencyContactRelation"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Relation
            </label>
            <input
              type="text"
              id="emergencyContactRelation"
              {...register("emergencyContactRelation")}
              className={inputClass("emergencyContactRelation")}
              placeholder="Spouse"
            />
            {fieldError("emergencyContactRelation") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("emergencyContactRelation")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="emergencyContactNumber"
              className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="emergencyContactNumber"
              {...register("emergencyContactNumber")}
              className={inputClass("emergencyContactNumber")}
              placeholder="+1 (555) 987-6543"
            />
            {fieldError("emergencyContactNumber") && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldError("emergencyContactNumber")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
