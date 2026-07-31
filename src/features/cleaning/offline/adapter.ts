import { getOfflineDb, type OfflineCleaningTask } from "@/lib/offline/db";
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

export function registerCleaningOfflineAdapter() {
  registerSyncAdapter({
    feature: "cleaning",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "cleaning");
      if (pending.length === 0) return;

      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "cleaning_task" && entry.operation === "create") {
            const payload = entry.payload as OfflineCleaningTask;
            const { error } = await supabase.from("cleaning_tasks").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              title: payload.title,
              area: payload.area,
              frequency: payload.frequency,
              notes: payload.notes,
              last_cleaned_at: payload.lastCleanedAt,
              last_cleaned_by: payload.lastCleanedBy,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "cleaning_task" && entry.operation === "update") {
            const payload = entry.payload as Partial<OfflineCleaningTask> & { id: string };
            const { error } = await supabase
              .from("cleaning_tasks")
              .update({
                last_cleaned_at: payload.lastCleanedAt,
                last_cleaned_by: payload.lastCleanedBy,
                title: payload.title,
                updated_at: new Date().toISOString(),
              })
              .eq("id", payload.id)
              .eq("workspace_id", workspaceId);
            if (error) throw error;
          }

          if (entry.entity === "cleaning_task" && entry.operation === "delete") {
            const { error } = await supabase
              .from("cleaning_tasks")
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
        .from("cleaning_tasks")
        .select("id, title, area, frequency, notes, last_cleaned_at, last_cleaned_by, updated_at")
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.cleaningTasks, async () => {
        await db.cleaningTasks.where({ workspaceId }).delete();
        await db.cleaningTasks.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            title: row.title,
            area: row.area,
            frequency: row.frequency,
            notes: row.notes,
            lastCleanedAt: row.last_cleaned_at,
            lastCleanedBy: row.last_cleaned_by,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
