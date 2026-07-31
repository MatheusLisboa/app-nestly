import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const babyStatusEnum = pgEnum("baby_status", ["expected", "born"]);
export const babyCareTypeEnum = pgEnum("baby_care_type", [
  "feeding",
  "diaper",
  "sleep",
  "note",
]);
export const babyPrepCategoryEnum = pgEnum("baby_prep_category", [
  "enxoval",
  "pharmacy",
  "nursery",
  "items",
]);

export const babies = pgTable(
  "babies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: babyStatusEnum("status").notNull().default("expected"),
    dueDate: date("due_date"),
    birthDate: date("birth_date"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("babies_workspace_idx").on(table.workspaceId)],
);

export const babyCareLogs = pgTable(
  "baby_care_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    babyId: uuid("baby_id")
      .notNull()
      .references(() => babies.id, { onDelete: "cascade" }),
    type: babyCareTypeEnum("type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    detail: text("detail"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("baby_care_logs_baby_idx").on(table.babyId),
    index("baby_care_logs_workspace_idx").on(table.workspaceId),
    index("baby_care_logs_occurred_idx").on(table.babyId, table.occurredAt),
  ],
);

export const babyPrepItems = pgTable(
  "baby_prep_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    babyId: uuid("baby_id")
      .notNull()
      .references(() => babies.id, { onDelete: "cascade" }),
    category: babyPrepCategoryEnum("category").notNull(),
    title: text("title").notNull(),
    checked: boolean("checked").notNull().default(false),
    notes: text("notes"),
    position: integer("position").notNull().default(0),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("baby_prep_items_baby_idx").on(table.babyId),
    index("baby_prep_items_category_idx").on(table.babyId, table.category),
    index("baby_prep_items_workspace_idx").on(table.workspaceId),
  ],
);

export type Baby = typeof babies.$inferSelect;
export type BabyCareLog = typeof babyCareLogs.$inferSelect;
export type BabyPrepItem = typeof babyPrepItems.$inferSelect;
