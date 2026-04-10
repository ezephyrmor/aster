import { z } from "zod";

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
    .optional(),

  website: z
    .string()
    .url("Must be a valid URL")
    .max(255, "Website URL cannot exceed 255 characters")
    .optional(),

  status: z.enum(["active", "inactive", "archived"]).default("active"),

  industryId: z.number().int("Must be a valid industry ID").optional(),

  managerId: z.number().int("Must be a valid user ID").optional(),
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
