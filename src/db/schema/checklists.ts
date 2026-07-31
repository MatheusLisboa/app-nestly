import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const checklistStatusEnum = pgEnum("checklist_status", ["active", "archived"]);

export const checklists = pgTable(
  "checklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: checklistStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("checklists_workspace_idx").on(table.workspaceId),
    index("checklists_workspace_status_idx").on(table.workspaceId, table.status),
  ],
);

export const checklistItems = pgTable(
  "checklist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    checklistId: uuid("checklist_id")
      .notNull()
      .references(() => checklists.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    checked: boolean("checked").notNull().default(false),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    position: integer("position").notNull().default(0),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("checklist_items_checklist_idx").on(table.checklistId),
    index("checklist_items_workspace_idx").on(table.workspaceId),
    index("checklist_items_checked_idx").on(table.checklistId, table.checked),
  ],
);

export type Checklist = typeof checklists.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
