import { z } from "zod";
import { validationRules } from "./validation.utils";

const BaseUserSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["admin", "hr", "manager", "employee"]),
  firstName: validationRules.name,
  lastName: validationRules.name,
  middleName: z.string().optional(),
  contactNumber: validationRules.phone.optional().or(z.literal("")),
  personalEmail: validationRules.email.optional().or(z.literal("")),
  address: z.string().optional(),
  dateOfBirth: z.coerce
    .date()
    .optional()
    .or(z.string().transform((v) => (v ? new Date(v) : undefined))),
  position: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.coerce
    .date()
    .optional()
    .or(z.string().transform((v) => (v ? new Date(v) : undefined))),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: validationRules.phone.optional().or(z.literal("")),
  emergencyContactRelation: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = BaseUserSchema.extend({
  // For create, password is optional (auto-generated if not provided)
});

/**
 * Schema for updating an existing user
 */
export const UpdateUserSchema = BaseUserSchema.partial();

/**
 * Schema for login form
 */
export const LoginSchema = z.object({
  username: validationRules.requiredString,
  password: validationRules.requiredString,
});

// Infer types from schemas
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
