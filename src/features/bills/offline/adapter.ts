import { getOfflineDb, type OfflineBill } from "@/lib/offline/db";
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

export function registerBillsOfflineAdapter() {
  registerSyncAdapter({
    feature: "bills",
    enabled: true,
    async push(workspaceId) {
      const pending = await listPendingOutbox(workspaceId, "bills");
      if (pending.length === 0) return;
      const supabase = createBrowserSupabaseClient();

      for (const entry of pending) {
        try {
          if (entry.entity === "bill" && entry.operation === "create") {
            const payload = entry.payload as OfflineBill;
            const { error } = await supabase.from("bills").upsert({
              id: payload.id,
              workspace_id: workspaceId,
              title: payload.title,
              amount: payload.amount,
              currency: payload.currency,
              category: payload.category,
              due_date: payload.dueDate,
              recurrence: payload.recurrence,
              status: payload.status,
              notes: payload.notes,
              paid_at: payload.paidAt,
              updated_at: payload.updatedAt,
            });
            if (error) throw error;
          }

          if (entry.entity === "bill" && entry.operation === "update") {
            const payload = entry.payload as Partial<OfflineBill> & { id: string };
            const { error } = await supabase
              .from("bills")
              .update({
                status: payload.status,
                paid_at: payload.paidAt,
                due_date: payload.dueDate,
                updated_at: new Date().toISOString(),
              })
              .eq("id", payload.id)
              .eq("workspace_id", workspaceId);
            if (error) throw error;
          }

          if (entry.entity === "bill" && entry.operation === "delete") {
            const { error } = await supabase
              .from("bills")
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
        .from("bills")
        .select(
          "id, title, amount, currency, category, due_date, recurrence, status, notes, paid_at, updated_at",
        )
        .eq("workspace_id", workspaceId);

      if (error || !data) return;

      const db = getOfflineDb();
      await db.transaction("rw", db.bills, async () => {
        await db.bills.where({ workspaceId }).delete();
        await db.bills.bulkPut(
          data.map((row) => ({
            id: row.id,
            workspaceId,
            title: row.title,
            amount: String(row.amount),
            currency: row.currency,
            category: row.category,
            dueDate: row.due_date,
            recurrence: row.recurrence,
            status: row.status,
            notes: row.notes,
            paidAt: row.paid_at,
            updatedAt: row.updated_at,
          })),
        );
      });
    },
  });
}
