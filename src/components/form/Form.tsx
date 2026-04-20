"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormContext } from "./FormContext";
import type { FormProps } from "./types";
import { cn } from "@/lib/utils";

export function Form<T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: "onBlur",
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
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
