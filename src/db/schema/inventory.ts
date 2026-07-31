import { index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const inventoryLocations = pgTable(
  "inventory_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inventory_locations_workspace_idx").on(table.workspaceId)],
);

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category"),
    locationId: uuid("location_id").references(() => inventoryLocations.id, {
      onDelete: "set null",
    }),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("0"),
    unit: text("unit").notNull().default("un"),
    minQuantity: numeric("min_quantity", { precision: 12, scale: 2 }).notNull().default("0"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("inventory_items_workspace_idx").on(table.workspaceId),
    index("inventory_items_location_idx").on(table.locationId),
    index("inventory_items_name_idx").on(table.workspaceId, table.name),
  ],
);

export type InventoryLocation = typeof inventoryLocations.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
