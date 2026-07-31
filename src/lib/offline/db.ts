import Dexie, { type EntityTable } from "dexie";

export type OutboxOperation = "create" | "update" | "delete";
export type OutboxStatus = "pending" | "syncing" | "failed" | "done";

export interface OutboxItem {
  id?: number;
  workspaceId: string;
  feature: string;
  entity: string;
  entityId: string;
  operation: OutboxOperation;
  payload: unknown;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SyncCursor {
  id?: number;
  workspaceId: string;
  feature: string;
  cursor: string;
  updatedAt: number;
}

export interface MetaKV {
  key: string;
  value: unknown;
}

/** Cached shopping item for offline reads */
export interface OfflineShoppingItem {
  id: string;
  workspaceId: string;
  listId: string;
  name: string;
  quantity: string;
  unit: string;
  notes: string | null;
  checked: boolean;
  inventoryItemId: string | null;
  position: number;
  updatedAt: string;
}

export interface OfflineInventoryItem {
  id: string;
  workspaceId: string;
  name: string;
  category: string | null;
  locationId: string | null;
  quantity: string;
  unit: string;
  minQuantity: string;
  notes: string | null;
  updatedAt: string;
}

export interface OfflineChecklistItem {
  id: string;
  workspaceId: string;
  checklistId: string;
  title: string;
  checked: boolean;
  position: number;
  updatedAt: string;
}

export interface OfflineCleaningTask {
  id: string;
  workspaceId: string;
  title: string;
  area: string | null;
  frequency: string;
  notes: string | null;
  lastCleanedAt: string | null;
  lastCleanedBy: string | null;
  updatedAt: string;
}

export interface OfflineBill {
  id: string;
  workspaceId: string;
  title: string;
  amount: string;
  currency: string;
  category: string | null;
  dueDate: string;
  recurrence: string;
  status: string;
  notes: string | null;
  paidAt: string | null;
  updatedAt: string;
}

export interface OfflineCalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface OfflineBabyCareLog {
  id: string;
  workspaceId: string;
  babyId: string;
  type: string;
  occurredAt: string;
  detail: string | null;
  notes: string | null;
  updatedAt: string;
}

export class NestlyOfflineDb extends Dexie {
  outbox!: EntityTable<OutboxItem, "id">;
  syncCursors!: EntityTable<SyncCursor, "id">;
  meta!: EntityTable<MetaKV, "key">;
  shoppingItems!: EntityTable<OfflineShoppingItem, "id">;
  inventoryItems!: EntityTable<OfflineInventoryItem, "id">;
  checklistItems!: EntityTable<OfflineChecklistItem, "id">;
  cleaningTasks!: EntityTable<OfflineCleaningTask, "id">;
  bills!: EntityTable<OfflineBill, "id">;
  calendarEvents!: EntityTable<OfflineCalendarEvent, "id">;
  babyCareLogs!: EntityTable<OfflineBabyCareLog, "id">;

  constructor() {
    super("nestly_offline");

    this.version(1).stores({
      outbox: "++id, workspaceId, feature, status, [workspaceId+feature], createdAt",
      syncCursors: "++id, &[workspaceId+feature], workspaceId, feature",
      meta: "key",
    });

    this.version(2).stores({
      outbox: "++id, workspaceId, feature, status, [workspaceId+feature], createdAt",
      syncCursors: "++id, &[workspaceId+feature], workspaceId, feature",
      meta: "key",
      shoppingItems: "id, workspaceId, listId, [workspaceId+listId], checked",
      inventoryItems: "id, workspaceId, name",
    });

    this.version(3).stores({
      outbox: "++id, workspaceId, feature, status, [workspaceId+feature], createdAt",
      syncCursors: "++id, &[workspaceId+feature], workspaceId, feature",
      meta: "key",
      shoppingItems: "id, workspaceId, listId, [workspaceId+listId], checked",
      inventoryItems: "id, workspaceId, name",
      checklistItems: "id, workspaceId, checklistId, [workspaceId+checklistId], checked",
    });

    this.version(4).stores({
      outbox: "++id, workspaceId, feature, status, [workspaceId+feature], createdAt",
      syncCursors: "++id, &[workspaceId+feature], workspaceId, feature",
      meta: "key",
      shoppingItems: "id, workspaceId, listId, [workspaceId+listId], checked",
      inventoryItems: "id, workspaceId, name",
      checklistItems: "id, workspaceId, checklistId, [workspaceId+checklistId], checked",
      cleaningTasks: "id, workspaceId, frequency",
    });

    this.version(5).stores({
      outbox: "++id, workspaceId, feature, status, [workspaceId+feature], createdAt",
      syncCursors: "++id, &[workspaceId+feature], workspaceId, feature",
      meta: "key",
      shoppingItems: "id, workspaceId, listId, [workspaceId+listId], checked",
      inventoryItems: "id, workspaceId, name",
      checklistItems: "id, workspaceId, checklistId, [workspaceId+checklistId], checked",
      cleaningTasks: "id, workspaceId, frequency",
      bills: "id, workspaceId, dueDate, status",
      calendarEvents: "id, workspaceId, startsAt",
    });

    this.version(6).stores({
      outbox: "++id, workspaceId, feature, status, [workspaceId+feature], createdAt",
      syncCursors: "++id, &[workspaceId+feature], workspaceId, feature",
      meta: "key",
      shoppingItems: "id, workspaceId, listId, [workspaceId+listId], checked",
      inventoryItems: "id, workspaceId, name",
      checklistItems: "id, workspaceId, checklistId, [workspaceId+checklistId], checked",
      cleaningTasks: "id, workspaceId, frequency",
      bills: "id, workspaceId, dueDate, status",
      calendarEvents: "id, workspaceId, startsAt",
      babyCareLogs: "id, workspaceId, babyId, type, occurredAt",
    });
  }
}

let dbInstance: NestlyOfflineDb | null = null;

export function getOfflineDb(): NestlyOfflineDb {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment.");
  }

  if (!dbInstance) {
    dbInstance = new NestlyOfflineDb();
  }

  return dbInstance;
}
