"use client";

import { useId, useState, useEffect } from "react";
import { useFormContext } from "./FormContext";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./types";

interface LookupOption {
  id: number;
  name: string;
}

interface AsyncSelectProps extends FieldProps {
  endpoint: string;
  placeholder?: string;
  className?: string;
}

export function AsyncSelect({
  name,
  label,
  endpoint,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  rules,
  className,
}: AsyncSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const { form } = useFormContext();

  const {
    register,
    formState: { errors },
  } = form;

  const [options, setOptions] = useState<LookupOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch options`);
        }

        const data = await response.json();
        setOptions(data);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load options",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [endpoint]);

  const fieldError = errors[name as string];
  const hasError = !!fieldError || !!fetchError;

  const inputClass = cn(
    "mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100",
    "transition-colors outline-none px-2.5 py-1.5 h-9",
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
    disabled && "bg-gray-100 cursor-not-allowed opacity-50",
    className,
  );

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

      {isLoading ? (
        <div className={inputClass} style={{ padding: "0.5rem 0.75rem" }}>
          <div className="animate-pulse text-gray-400">Loading options...</div>
        </div>
      ) : fetchError ? (
        <div className={inputClass} style={{ padding: "0.5rem 0.75rem" }}>
          <div className="text-red-500">{fetchError}</div>
        </div>
      ) : (
        <select
          id={id}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={inputClass}
          {...register(name as any, rules)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}

      {(fieldError || fetchError) && (
        <p
          id={errorId}
          className="text-xs text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {(fieldError?.message as string) || fetchError}
        </p>
      )}
    </div>
  );
}
