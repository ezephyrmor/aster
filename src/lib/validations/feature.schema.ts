import { z } from "zod";
import { validationRules } from "./validation.utils";

const BaseFeatureSchema = z.object({
  code: validationRules.requiredString.max(150),
  name: validationRules.requiredString.max(120),
  description: z.string().optional(),
  domain: validationRules.requiredString.max(50),
  kind: z.enum(["page", "action", "api"]),
  httpMethod: z.string().max(10).optional(),
  path: validationRules.requiredString.max(255),
});

/**
 * Schema for creating a new feature
 */
export const CreateFeatureSchema = BaseFeatureSchema;

/**
 * Schema for updating an existing feature
 */
export const UpdateFeatureSchema = BaseFeatureSchema.partial();

// Infer types from schemas
export type CreateFeatureData = z.infer<typeof CreateFeatureSchema>;
export type UpdateFeatureData = z.infer<typeof UpdateFeatureSchema>;
