import { z } from "zod";
import { validationRules } from "./validation.utils";

export const BrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name cannot exceed 100 characters")
    .trim(),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .trim()
    .optional(),

  logo: z
    .string()
    .url("Must be a valid URL")
    .max(500, "Logo URL cannot exceed 500 characters")
    .optional()
    .or(z.literal(""))
    .transform((value: string | undefined) =>
      value === "" ? undefined : value,
    ),

  website: z
    .string()
    .url("Must be a valid URL")
    .max(255, "Website URL cannot exceed 255 characters")
    .optional()
    .or(z.literal(""))
    .transform((value: string | undefined) =>
      value === "" ? undefined : value,
    ),

  status: z.enum(["active", "inactive", "archived"]).default("active"),

  industryId: validationRules.optionalUuid,

  managerId: validationRules.optionalUuid,
});

export const CreateBrandSchema = BrandSchema.extend({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name cannot exceed 100 characters")
    .trim(),
});

export const UpdateBrandSchema = BrandSchema.partial();

export type BrandData = z.infer<typeof BrandSchema>;
export type CreateBrandData = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandData = z.infer<typeof UpdateBrandSchema>;
