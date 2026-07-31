import { DomainError } from "@/lib/errors";
import { localDateTimeToUtcIso } from "@/lib/utils/datetime";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type CalendarEventView = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location: string | null;
  notes: string | null;
  updatedAt: string;
};

function toView(row: {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  notes: string | null;
  updated_at: string;
}): CalendarEventView {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allDay: row.all_day,
    location: row.location,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

export async function listCalendarEvents(range?: {
  from: string;
  to: string;
}): Promise<CalendarEventView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("calendar.read");

  let query = supabase
    .from("calendar_events")
    .select("id, title, starts_at, ends_at, all_day, location, notes, updated_at")
    .eq("workspace_id", workspace.id)
    .order("starts_at", { ascending: true });

  if (range) {
    query = query.gte("starts_at", range.from).lte("starts_at", range.to);
  }

  const { data, error } = await query;

  if (error) {
    throw new DomainError("CALENDAR_LIST_FAILED", error.message);
  }

  return (data ?? []).map(toView);
}

export async function createCalendarEvent(input: {
  title: string;
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  location?: string;
  notes?: string;
}): Promise<CalendarEventView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("calendar.write");

  const startsAt = input.allDay
    ? localDateTimeToUtcIso(input.startsAt.slice(0, 10))
    : localDateTimeToUtcIso(input.startsAt);

  let endsAt: string | null = null;
  if (input.endsAt) {
    endsAt = input.allDay
      ? localDateTimeToUtcIso(input.endsAt.slice(0, 10))
      : localDateTimeToUtcIso(input.endsAt);
  }

  if (Number.isNaN(new Date(startsAt).getTime()) || (endsAt && Number.isNaN(new Date(endsAt).getTime()))) {
    throw new DomainError("VALIDATION_ERROR", "Data/hora inválida.");
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      workspace_id: workspace.id,
      title: input.title,
      starts_at: startsAt,
      ends_at: endsAt,
      all_day: input.allDay,
      location: input.location || null,
      notes: input.notes || null,
      created_by: user.id,
    })
    .select("id, title, starts_at, ends_at, all_day, location, notes, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("CALENDAR_CREATE_FAILED", error?.message ?? "Falha ao criar evento.");
  }

  return toView(data);
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("calendar.write");

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", eventId);

  if (error) {
    throw new DomainError("CALENDAR_DELETE_FAILED", error.message);
  }
}
