"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormContext } from "./FormContext";
import type { FormProps } from "./types";
import { cn } from "@/lib/utils";

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  values,
  disabled = false,
  resetOnSubmit = true,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    values,
    mode: "onBlur",
    disabled,
  });

  useEffect(() => {
    // Update form when external values prop changes
    if (values) {
      form.reset(values);
    }
  }, [values, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      if (resetOnSubmit) {
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <FormContext.Provider value={{ form, isSubmitting }}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
          {children}
        </form>
      </FormProvider>
    </FormContext.Provider>
  );
}
