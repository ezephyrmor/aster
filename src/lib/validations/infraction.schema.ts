import { z } from "zod";
import { validationRules } from "./validation.utils";

export const InfractionSchema = z.object({
  userId: validationRules.uuid,

  offenseId: validationRules.uuid,

  typeId: validationRules.uuid,

  date: z.preprocess((val) => new Date(val as string), z.date()),

  details: z
    .string()
    .max(2000, "Details cannot exceed 2000 characters")
    .trim()
    .optional(),

  comment: z
    .string()
    .max(2000, "Comment cannot exceed 2000 characters")
    .trim()
    .optional(),

  reportedById: validationRules.uuid,

  status: z
    .enum(["pending", "investigating", "resolved", "dismissed"])
    .default("pending"),

  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const CreateInfractionSchema = InfractionSchema;
export const UpdateInfractionSchema = InfractionSchema.partial();

export type InfractionData = z.infer<typeof InfractionSchema>;
export type CreateInfractionData = z.infer<typeof CreateInfractionSchema>;
export type UpdateInfractionData = z.infer<typeof UpdateInfractionSchema>;
