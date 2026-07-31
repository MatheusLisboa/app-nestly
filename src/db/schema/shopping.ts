import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const shoppingListStatusEnum = pgEnum("shopping_list_status", ["active", "archived"]);

export const shoppingLists = pgTable(
  "shopping_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: shoppingListStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("shopping_lists_workspace_idx").on(table.workspaceId),
    index("shopping_lists_workspace_status_idx").on(table.workspaceId, table.status),
  ],
);

export const shoppingItems = pgTable(
  "shopping_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    listId: uuid("list_id")
      .notNull()
      .references(() => shoppingLists.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("1"),
    unit: text("unit").notNull().default("un"),
    notes: text("notes"),
    aisle: text("aisle"),
    checked: boolean("checked").notNull().default(false),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    inventoryItemId: uuid("inventory_item_id"), // linked in app layer; FK optional to avoid circular migrate issues
    position: integer("position").notNull().default(0),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("shopping_items_list_idx").on(table.listId),
    index("shopping_items_workspace_idx").on(table.workspaceId),
    index("shopping_items_checked_idx").on(table.listId, table.checked),
  ],
);

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
