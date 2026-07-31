import { z } from "zod";

export const createCalendarEventSchema = z.object({
  title: z.string().trim().min(1).max(120),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  allDay: z.boolean(),
  location: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const deleteCalendarEventSchema = z.object({
  eventId: z.string().uuid(),
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
