import type {
  UseFormReturn,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import type { ZodSchema } from "zod";

export interface FormContextValue<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  isSubmitting: boolean;
}

export interface FieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: RegisterOptions<T>;
}

export interface FormProps<T extends FieldValues = FieldValues> {
  schema?: ZodSchema<T>;
  defaultValues?: T;
  values?: T;
  disabled?: boolean;
  resetOnSubmit?: boolean;
  onSubmit: (values: T) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}
