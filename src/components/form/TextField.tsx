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
  min?: string;
  max?: string;
  autoComplete?: string;
  leftIcon?: React.ReactNode;
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
  min,
  max,
  autoComplete,
  leftIcon,
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

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {leftIcon}
        </div>

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(leftIcon && "pl-10")}
          {...register(name as any, rules)}
        />
      </div>

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
