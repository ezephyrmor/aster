"use client";

import { useId } from "react";
import { useFormContext } from "./FormContext";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./types";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends FieldProps {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({
  name,
  label,
  options,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  rules,
  className,
}: SelectProps) {
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
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <select
        id={id}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(
          "mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100",
          "transition-colors outline-none px-2.5 py-1.5 h-9",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
          disabled && "bg-gray-100 cursor-not-allowed opacity-50",
        )}
        {...register(name as any, rules)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p
          id={errorId}
          className="text-xs text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}
