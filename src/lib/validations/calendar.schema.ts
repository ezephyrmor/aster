import { z } from "zod";

const CalendarEventBaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .trim()
    .optional(),

  startDate: z.preprocess((val) => new Date(val as string), z.date()),

  endDate: z.preprocess((val) => new Date(val as string), z.date()),

  color: z
    .string()
    .max(20, "Color cannot exceed 20 characters")
    .default("blue"),
});

export const CalendarEventSchema = CalendarEventBaseSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);

export const CreateCalendarEventSchema = CalendarEventSchema;
export const UpdateCalendarEventSchema = CalendarEventBaseSchema.partial();

export type CalendarEventData = z.infer<typeof CalendarEventSchema>;
export type CreateCalendarEventData = z.infer<typeof CreateCalendarEventSchema>;
export type UpdateCalendarEventData = z.infer<typeof UpdateCalendarEventSchema>;
