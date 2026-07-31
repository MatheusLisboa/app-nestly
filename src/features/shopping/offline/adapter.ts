import { getOfflineDb, type OfflineShoppingItem } from "@/lib/offline/db";
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

export function registerShoppingOfflineAdapter() {
  registerSyncAdapter({
    feature: "shopping",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "shopping");
      if (pending.length === 0) return;

      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "shopping_item" && entry.operation === "create") {
            const payload = entry.payload as OfflineShoppingItem;
            const { error } = await supabase.from("shopping_items").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              list_id: payload.listId,
              name: payload.name,
              quantity: payload.quantity,
              unit: payload.unit,
              notes: payload.notes,
              checked: payload.checked,
              inventory_item_id: payload.inventoryItemId,
              position: payload.position,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "shopping_item" && entry.operation === "update") {
            const payload = entry.payload as Partial<OfflineShoppingItem> & { id: string };
            const { error } = await supabase
              .from("shopping_items")
              .update({
                checked: payload.checked,
                name: payload.name,
                quantity: payload.quantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", payload.id)
              .eq("workspace_id", workspaceId);
            if (error) throw error;
          }

          if (entry.entity === "shopping_item" && entry.operation === "delete") {
            const { error } = await supabase
              .from("shopping_items")
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
        .from("shopping_items")
        .select(
          "id, list_id, name, quantity, unit, notes, checked, inventory_item_id, position, updated_at",
        )
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.shoppingItems, async () => {
        await db.shoppingItems.where({ workspaceId }).delete();
        await db.shoppingItems.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            listId: row.list_id,
            name: row.name,
            quantity: String(row.quantity),
            unit: row.unit,
            notes: row.notes,
            checked: row.checked,
            inventoryItemId: row.inventory_item_id,
            position: row.position,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
