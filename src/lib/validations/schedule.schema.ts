import { z } from "zod";
import { validationRules } from "./validation.utils";

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const ScheduleBaseSchema = z.object({
  userId: validationRules.uuid,

  dayOfWeek: z
    .number()
    .int("Day of week must be an integer")
    .min(0, "Day must be between 0 (Sunday) and 6 (Saturday)")
    .max(6, "Day must be between 0 (Sunday) and 6 (Saturday)"),

  startTime: z
    .string()
    .regex(TIME_REGEX, "Start time must be in HH:MM format (24-hour)"),

  endTime: z
    .string()
    .regex(TIME_REGEX, "End time must be in HH:MM format (24-hour)"),

  breakMinutes: z
    .number()
    .int("Break minutes must be an integer")
    .min(0, "Break minutes cannot be negative")
    .max(480, "Break cannot exceed 8 hours")
    .default(60),

  effectiveFrom: z.preprocess((val) => new Date(val as string), z.date()),

  effectiveTo: z.preprocess(
    (val) => (val ? new Date(val as string) : null),
    z.date().nullable().optional(),
  ),
});

export const ScheduleSchema = ScheduleBaseSchema.refine(
  (data) => data.endTime > data.startTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  },
);

export const CreateScheduleSchema = ScheduleSchema;
export const UpdateScheduleSchema = ScheduleBaseSchema.partial();

export type ScheduleData = z.infer<typeof ScheduleSchema>;
export type CreateScheduleData = z.infer<typeof CreateScheduleSchema>;
export type UpdateScheduleData = z.infer<typeof UpdateScheduleSchema>;
