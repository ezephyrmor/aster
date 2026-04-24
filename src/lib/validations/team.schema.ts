import { z } from "zod";

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

  brandId: z
    .number()
    .int("Must select a valid brand")
    .positive("Brand ID must be positive"),

  managerId: z.number().int("Must be a valid user ID").optional(),

  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const CreateTeamSchema = TeamSchema;
export const UpdateTeamSchema = TeamSchema.partial();

export type TeamData = z.infer<typeof TeamSchema>;
export type CreateTeamData = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamData = z.infer<typeof UpdateTeamSchema>;
