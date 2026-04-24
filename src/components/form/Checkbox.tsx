"use client";

import { useId } from "react";
import { useFormContext } from "./FormContext";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./types";

interface CheckboxProps extends FieldProps {}

export function Checkbox({
  name,
  label,
  required = false,
  disabled = false,
  rules,
}: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const { form } = useFormContext();

  const {
    register,
    formState: { errors },
  } = form;

  const fieldError = errors[name as string];
  const hasError = !!fieldError;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            "mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-zinc-600",
            "bg-white dark:bg-zinc-700 text-indigo-600 focus:ring-indigo-500",
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...register(name as any, {
            ...rules,
            setValueAs: (value) => !!value,
          })}
        />

        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-zinc-300 cursor-pointer select-none"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
      </div>

      {hasError && (
        <p
          id={errorId}
          className="text-xs text-red-600 dark:text-red-400 pl-7"
          role="alert"
          aria-live="polite"
        >
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}
