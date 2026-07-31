import { getOfflineDb, type OfflineCalendarEvent } from "@/lib/offline/db";
import { registerSyncAdapter } from "@/lib/offline/registry";
import { listPendingOutbox } from "@/lib/offline/sync-engine";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

async function markOutboxDone(id: number | undefined) {
  if (id === undefined) return;
  const db = getOfflineDb();
  await db.outbox.update(id, { status: "done", updatedAt: Date.now() });
}

async function markOutboxFailed(id: number | undefined, message: string) {
  if (id === undefined) return;
  const db = getOfflineDb();
  const row = await db.outbox.get(id);
  await db.outbox.update(id, {
    status: "failed",
    attempts: (row?.attempts ?? 0) + 1,
    lastError: message,
    updatedAt: Date.now(),
  });
}

export function registerCalendarOfflineAdapter() {
  registerSyncAdapter({
    feature: "calendar",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "calendar");
      if (pending.length === 0) return;
      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "calendar_event" && entry.operation === "create") {
            const payload = entry.payload as OfflineCalendarEvent;
            const { error } = await supabase.from("calendar_events").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              title: payload.title,
              starts_at: payload.startsAt,
              ends_at: payload.endsAt,
              all_day: payload.allDay,
              location: payload.location,
              notes: payload.notes,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "calendar_event" && entry.operation === "delete") {
            const { error } = await supabase
              .from("calendar_events")
              .delete()
              .eq("id", entry.entityId)
              .eq("workspace_id", workspaceId);
            if (error) throw error;
          }

          await markOutboxDone(entry.id);
        } catch (error) {
          await markOutboxFailed(entry.id, error instanceof Error ? error.message : "Sync failed");
        }
      }
    },
    async pull(workspaceId) {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title, starts_at, ends_at, all_day, location, notes, updated_at")
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.calendarEvents, async () => {
        await db.calendarEvents.where({ workspaceId }).delete();
        await db.calendarEvents.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            title: row.title,
            startsAt: row.starts_at,
            endsAt: row.ends_at,
            allDay: row.all_day,
            location: row.location,
            notes: row.notes,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
