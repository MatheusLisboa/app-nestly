import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const workspaceRoleEnum = pgEnum("workspace_role", ["owner", "admin", "member", "viewer"]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

/**
 * App profile — 1:1 with auth.users (Supabase).
 * Identity only; shared data lives under workspaces.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // equals auth.users.id
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  locale: text("locale").notNull().default("pt-BR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tenant root. UI may label this as "Família".
 */
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    timezone: text("timezone").notNull().default("America/Sao_Paulo"),
    avatarUrl: text("avatar_url"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("workspaces_slug_uidx").on(table.slug)],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    index("workspace_members_user_idx").on(table.userId),
  ],
);

export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: workspaceRoleEnum("role").notNull().default("member"),
    token: text("token").notNull(),
    status: invitationStatusEnum("status").notNull().default("pending"),
    invitedBy: uuid("invited_by").references(() => profiles.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("workspace_invitations_token_uidx").on(table.token),
    index("workspace_invitations_workspace_idx").on(table.workspaceId),
    index("workspace_invitations_email_idx").on(table.email),
  ],
);

/**
 * Permission catalog — stable codes used by RBAC checks.
 * Example: "workspace.manage", "members.invite", "shopping.write"
 */
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Maps workspace roles to permission codes.
 * Seeded; can be extended without schema changes to domain tables.
 */
export const rolePermissions = pgTable(
  "role_permissions",
  {
    role: workspaceRoleEnum("role").notNull(),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.role, table.permissionId] })],
);

/**
 * Generic outbox mirror metadata for server-side conflict inspection (optional).
 * Client outbox lives in Dexie; this table is for audit/debug if needed later.
 */
export const syncMeta = pgTable("sync_meta", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  clientId: text("client_id"),
  payload: jsonb("payload"),
  isActive: boolean("is_active").notNull().default(true),
});

export type Profile = typeof profiles.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];
