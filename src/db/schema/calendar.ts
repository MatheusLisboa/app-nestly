import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles, workspaces } from "./workspace";

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    allDay: boolean("all_day").notNull().default(false),
    location: text("location"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("calendar_events_workspace_idx").on(table.workspaceId),
    index("calendar_events_workspace_starts_idx").on(table.workspaceId, table.startsAt),
  ],
);

export type CalendarEvent = typeof calendarEvents.$inferSelect;
