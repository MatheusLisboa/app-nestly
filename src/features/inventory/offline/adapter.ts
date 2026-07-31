import { getOfflineDb, type OfflineInventoryItem } from "@/lib/offline/db";
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

export function registerInventoryOfflineAdapter() {
  registerSyncAdapter({
    feature: "inventory",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "inventory");
      if (pending.length === 0) return;

      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "inventory_item" && entry.operation === "create") {
            const payload = entry.payload as OfflineInventoryItem;
            const { error } = await supabase.from("inventory_items").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              name: payload.name,
              category: payload.category,
              location_id: payload.locationId,
              quantity: payload.quantity,
              unit: payload.unit,
              min_quantity: payload.minQuantity,
              notes: payload.notes,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "inventory_item" && entry.operation === "update") {
            const payload = entry.payload as Partial<OfflineInventoryItem> & { id: string };
            const { error } = await supabase
              .from("inventory_items")
              .update({
                quantity: payload.quantity,
                name: payload.name,
                updated_at: new Date().toISOString(),
              })
              .eq("id", payload.id)
              .eq("workspace_id", workspaceId);
            if (error) throw error;
          }

          if (entry.entity === "inventory_item" && entry.operation === "delete") {
            const { error } = await supabase
              .from("inventory_items")
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
        .from("inventory_items")
        .select("id, name, category, location_id, quantity, unit, min_quantity, notes, updated_at")
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.inventoryItems, async () => {
        await db.inventoryItems.where({ workspaceId }).delete();
        await db.inventoryItems.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            name: row.name,
            category: row.category,
            locationId: row.location_id,
            quantity: String(row.quantity),
            unit: row.unit,
            minQuantity: String(row.min_quantity),
            notes: row.notes,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
