import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const cleaningFrequencyEnum = pgEnum("cleaning_frequency", [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
]);

export const cleaningTasks = pgTable(
  "cleaning_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    area: text("area"),
    frequency: cleaningFrequencyEnum("frequency").notNull().default("weekly"),
    notes: text("notes"),
    lastCleanedAt: timestamp("last_cleaned_at", { withTimezone: true }),
    lastCleanedBy: uuid("last_cleaned_by").references(() => profiles.id),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("cleaning_tasks_workspace_idx").on(table.workspaceId),
    index("cleaning_tasks_workspace_frequency_idx").on(table.workspaceId, table.frequency),
  ],
);

export const cleaningLogs = pgTable(
  "cleaning_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => cleaningTasks.id, { onDelete: "cascade" }),
    cleanedAt: timestamp("cleaned_at", { withTimezone: true }).notNull().defaultNow(),
    cleanedBy: uuid("cleaned_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("cleaning_logs_task_idx").on(table.taskId),
    index("cleaning_logs_workspace_idx").on(table.workspaceId),
  ],
);

export type CleaningTask = typeof cleaningTasks.$inferSelect;
export type CleaningLog = typeof cleaningLogs.$inferSelect;
