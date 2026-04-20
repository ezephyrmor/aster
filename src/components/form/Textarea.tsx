"use client";

import { useId } from "react";
import { useFormContext } from "./FormContext";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./types";

interface TextareaProps extends FieldProps {
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function Textarea({
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  rows = 3,
  rules,
  className,
}: TextareaProps) {
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

      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(
          "mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100 resize-y",
          "transition-colors outline-none px-2.5 py-1.5",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
          disabled && "bg-gray-100 cursor-not-allowed opacity-50",
        )}
        {...register(name as any, rules)}
      />

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
