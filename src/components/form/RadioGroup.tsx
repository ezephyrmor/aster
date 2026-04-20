"use client";

import { useId } from "react";
import { useFormContext } from "./FormContext";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./types";

interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps extends FieldProps {
  options: RadioOption[];
  className?: string;
}

export function RadioGroup({
  name,
  label,
  options,
  required = false,
  disabled = false,
  rules,
  className,
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const { form } = useFormContext();

  const {
    register,
    formState: { errors },
  } = form;

  const fieldError = errors[name as string];
  const hasError = !!fieldError;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </div>
      )}

      <div
        className="space-y-2"
        role="radiogroup"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-3">
              <input
                id={optionId}
                type="radio"
                value={option.value}
                disabled={disabled || option.disabled}
                className={cn(
                  "h-4 w-4 border-gray-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500",
                  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                )}
                {...register(name as any, rules)}
              />
              <label
                htmlFor={optionId}
                className="block text-sm text-gray-700 dark:text-zinc-300 cursor-pointer select-none"
              >
                {option.label}
              </label>
            </div>
          );
        })}
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
