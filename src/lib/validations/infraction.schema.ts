import { z } from "zod";

export const InfractionSchema = z.object({
  userId: z
    .number()
    .int("Must select a valid user")
    .positive("User ID must be positive"),

  offenseId: z
    .number()
    .int("Must select a valid offense")
    .positive("Offense ID must be positive"),

  typeId: z
    .number()
    .int("Must select a valid infraction type")
    .positive("Type ID must be positive"),

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
});

export const CreateInfractionSchema = InfractionSchema;
export const UpdateInfractionSchema = InfractionSchema.partial();

export type InfractionData = z.infer<typeof InfractionSchema>;
export type CreateInfractionData = z.infer<typeof CreateInfractionSchema>;
export type UpdateInfractionData = z.infer<typeof UpdateInfractionSchema>;
