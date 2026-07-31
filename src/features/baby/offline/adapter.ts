import { getOfflineDb, type OfflineBabyCareLog } from "@/lib/offline/db";
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

export function registerBabyOfflineAdapter() {
  registerSyncAdapter({
    feature: "baby",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "baby");
      if (pending.length === 0) return;
      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "baby_care_log" && entry.operation === "create") {
            const payload = entry.payload as OfflineBabyCareLog;
            const { error } = await supabase.from("baby_care_logs").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              baby_id: payload.babyId,
              type: payload.type,
              occurred_at: payload.occurredAt,
              detail: payload.detail,
              notes: payload.notes,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "baby_care_log" && entry.operation === "delete") {
            const { error } = await supabase
              .from("baby_care_logs")
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
        .from("baby_care_logs")
        .select("id, baby_id, type, occurred_at, detail, notes, updated_at")
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.babyCareLogs, async () => {
        await db.babyCareLogs.where({ workspaceId }).delete();
        await db.babyCareLogs.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            babyId: row.baby_id,
            type: row.type,
            occurredAt: row.occurred_at,
            detail: row.detail,
            notes: row.notes,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
