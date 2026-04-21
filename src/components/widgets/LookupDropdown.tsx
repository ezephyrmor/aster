"use client";

import { useState, useEffect } from "react";
import { UseFormRegister } from "react-hook-form";

interface LookupOption {
  id: number;
  name: string;
}

interface LookupDropdownProps {
  endpoint: string;
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: string;
  className?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export default function LookupDropdown({
  endpoint,
  name,
  label,
  register,
  error,
  className = "",
  defaultValue = "",
  placeholder = "Select an option",
  required = false,
}: LookupDropdownProps) {
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${name} options`);
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
  }, [endpoint, name]);

  const inputClass = `mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-zinc-100 ${
    error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
  } ${className}`;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

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
          id={name}
          defaultValue={defaultValue}
          {...register(name)}
          className={inputClass}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
