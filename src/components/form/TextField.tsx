"use client";

import { useId } from "react";
import { useFormContext } from "./FormContext";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./types";

interface TextFieldProps extends FieldProps {
  type?: "text" | "email" | "password" | "tel" | "date" | "number";
  placeholder?: string;
  className?: string;
}

export function TextField({
  name,
  label,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  rules,
  className,
}: TextFieldProps) {
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

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
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
