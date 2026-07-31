/**
 * RBAC permission codes.
 * Features add their codes here as they come online.
 */
export const permissionCodes = [
  "workspace.manage",
  "workspace.delete",
  "members.invite",
  "members.manage",
  "shopping.read",
  "shopping.write",
  "inventory.read",
  "inventory.write",
  "checklists.read",
  "checklists.write",
  "cleaning.read",
  "cleaning.write",
  "bills.read",
  "bills.write",
  "calendar.read",
  "calendar.write",
  "baby.read",
  "baby.write",
] as const;

export type PermissionCode = (typeof permissionCodes)[number];

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

/** Default role → permission matrix (seed source of truth for V1) */
export const defaultRolePermissions: Record<WorkspaceRole, readonly PermissionCode[]> = {
  owner: permissionCodes,
  admin: permissionCodes.filter((code) => code !== "workspace.delete"),
  member: [
    "shopping.read",
    "shopping.write",
    "inventory.read",
    "inventory.write",
    "checklists.read",
    "checklists.write",
    "cleaning.read",
    "cleaning.write",
    "bills.read",
    "bills.write",
    "calendar.read",
    "calendar.write",
    "baby.read",
    "baby.write",
  ],
  viewer: [
    "shopping.read",
    "inventory.read",
    "checklists.read",
    "cleaning.read",
    "bills.read",
    "calendar.read",
    "baby.read",
  ],
};

export function roleHasPermission(role: WorkspaceRole, code: PermissionCode): boolean {
  return defaultRolePermissions[role].includes(code);
}
