/**
 * Offline sync adapter contract.
 * Features (shopping, inventory, checklists, …) implement this to opt into Offline First
 * without changing the sync engine.
 */
export interface SyncAdapter {
  /** Stable feature key, e.g. "shopping" */
  feature: string;
  /** Whether this adapter is active in the current phase */
  enabled: boolean;
  /** Push pending outbox items for this feature */
  push(workspaceId: string): Promise<void>;
  /** Pull remote changes into IndexedDB / Query cache */
  pull(workspaceId: string): Promise<void>;
}

const adapters = new Map<string, SyncAdapter>();

export function registerSyncAdapter(adapter: SyncAdapter): void {
  adapters.set(adapter.feature, adapter);
}

export function getSyncAdapters(options?: { enabledOnly?: boolean }): SyncAdapter[] {
  const list = [...adapters.values()];
  if (options?.enabledOnly) {
    return list.filter((adapter) => adapter.enabled);
  }
  return list;
}

export function getSyncAdapter(feature: string): SyncAdapter | undefined {
  return adapters.get(feature);
}
