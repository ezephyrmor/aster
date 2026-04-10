import { z } from "zod";

/**
 * Format Zod errors into a standardized field error object
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce(
    (acc, issue) => {
      const path = issue.path.join(".");
      acc[path] = issue.message;
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Validate data against a Zod schema and return typed result
 */
export async function validate<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
): Promise<{
  success: boolean;
  data?: z.infer<T>;
  errors?: Record<string, string>;
}> {
  const result = await schema.safeParseAsync(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,}$/, "Please enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  requiredString: z.string().min(1, "This field is required"),
  optionalString: z.string().optional(),
  date: z.coerce.date().optional(),
  positiveNumber: z.number().positive("Must be a positive number"),
};

/**
 * Helper for partial schema (for edit operations)
 */
export function partialSchema<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return schema.partial();
}
