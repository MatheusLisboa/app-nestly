import { date, index, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const billRecurrenceEnum = pgEnum("bill_recurrence", ["once", "monthly", "yearly"]);
export const billStatusEnum = pgEnum("bill_status", ["pending", "paid"]);

export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("BRL"),
    category: text("category"),
    dueDate: date("due_date").notNull(),
    recurrence: billRecurrenceEnum("recurrence").notNull().default("monthly"),
    status: billStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("bills_workspace_idx").on(table.workspaceId),
    index("bills_workspace_due_idx").on(table.workspaceId, table.dueDate),
    index("bills_workspace_status_idx").on(table.workspaceId, table.status),
  ],
);

export type Bill = typeof bills.$inferSelect;
