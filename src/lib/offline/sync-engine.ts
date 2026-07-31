import { getOfflineDb, type OutboxItem, type OutboxOperation } from "./db";
import { getSyncAdapters } from "./registry";

export async function enqueueOutbox(input: {
  workspaceId: string;
  feature: string;
  entity: string;
  entityId: string;
  operation: OutboxOperation;
  payload: unknown;
}): Promise<number> {
  const db = getOfflineDb();
  const now = Date.now();

  const id = await db.outbox.add({
    ...input,
    status: "pending",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  });

  if (id === undefined) {
    throw new Error("Failed to enqueue outbox item.");
  }

  return id;
}

export async function listPendingOutbox(
  workspaceId: string,
  feature?: string,
): Promise<OutboxItem[]> {
  const db = getOfflineDb();

  if (feature) {
    return db.outbox.where({ workspaceId, feature, status: "pending" }).sortBy("createdAt");
  }

  return db.outbox.where({ workspaceId, status: "pending" }).sortBy("createdAt");
}

/**
 * Flushes outbox + pulls for all enabled adapters.
 * Safe to call on focus / online events.
 */
export async function runSyncCycle(workspaceId: string): Promise<void> {
  const adapters = getSyncAdapters({ enabledOnly: true });

  for (const adapter of adapters) {
    await adapter.push(workspaceId);
    await adapter.pull(workspaceId);
  }
}

/** @deprecated prefer feature-local adapters registered from OfflineBootstrap */
export function registerPhase1OfflineStubs(): void {}
