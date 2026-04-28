import { z } from "zod";
import { validationRules } from "./validation.utils";

export const TeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(100, "Team name cannot exceed 100 characters")
    .trim(),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .trim()
    .optional(),

  brandId: validationRules.uuid,

  managerId: validationRules.optionalUuid,

  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const CreateTeamSchema = TeamSchema;
export const UpdateTeamSchema = TeamSchema.partial();

export type TeamData = z.infer<typeof TeamSchema>;
export type CreateTeamData = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamData = z.infer<typeof UpdateTeamSchema>;
