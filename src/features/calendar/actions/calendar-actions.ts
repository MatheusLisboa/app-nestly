"use server";

import { revalidatePath } from "next/cache";
import {
  createCalendarEventSchema,
  deleteCalendarEventSchema,
} from "@/features/calendar/schemas/calendar";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/features/calendar/services/calendar-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createCalendarEventAction = createSafeAction({
  schema: createCalendarEventSchema,
  async handler(input) {
    const event = await createCalendarEvent(input);
    revalidatePath("/calendar");
    return event;
  },
});

export const deleteCalendarEventAction = createSafeAction({
  schema: deleteCalendarEventSchema,
  async handler(input) {
    await deleteCalendarEvent(input.eventId);
    revalidatePath("/calendar");
    return { ok: true as const };
  },
});
