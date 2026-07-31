import { getOfflineDb, type OfflineChecklistItem } from "@/lib/offline/db";
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

export function registerChecklistsOfflineAdapter() {
  registerSyncAdapter({
    feature: "checklists",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "checklists");
      if (pending.length === 0) return;

      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "checklist_item" && entry.operation === "create") {
            const payload = entry.payload as OfflineChecklistItem;
            const { error } = await supabase.from("checklist_items").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              checklist_id: payload.checklistId,
              title: payload.title,
              checked: payload.checked,
              position: payload.position,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "checklist_item" && entry.operation === "update") {
            const payload = entry.payload as Partial<OfflineChecklistItem> & { id: string };
            const { error } = await supabase
              .from("checklist_items")
              .update({
                checked: payload.checked,
                title: payload.title,
                checked_at: payload.checked ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", payload.id)
              .eq("workspace_id", workspaceId);
            if (error) throw error;
          }

          if (entry.entity === "checklist_item" && entry.operation === "delete") {
            const { error } = await supabase
              .from("checklist_items")
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
        .from("checklist_items")
        .select("id, checklist_id, title, checked, position, updated_at")
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.checklistItems, async () => {
        await db.checklistItems.where({ workspaceId }).delete();
        await db.checklistItems.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            checklistId: row.checklist_id,
            title: row.title,
            checked: row.checked,
            position: row.position,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
