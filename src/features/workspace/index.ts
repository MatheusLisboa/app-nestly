export const workspaceFeature = {
  id: "workspace" as const,
};

export {
  acceptInviteAction,
  createWorkspaceAction,
  inviteMemberAction,
  switchWorkspaceAction,
} from "./actions/workspace-actions";
export { CreateWorkspaceForm } from "./components/create-workspace-form";
export { InviteMemberForm } from "./components/invite-member-form";
export { useWorkspaceShell } from "./components/workspace-shell-provider";
export { WorkspaceSwitcher } from "./components/workspace-switcher";
export {
  acceptInviteSchema,
  createWorkspaceSchema,
  inviteMemberSchema,
  switchWorkspaceSchema,
} from "./schemas/workspace";
export {
  acceptInvitation,
  createWorkspace,
  inviteMember,
  listUserWorkspaces,
  listWorkspaceMembers,
  resolveActiveWorkspace,
  switchWorkspace,
  type WorkspaceMemberView,
  type WorkspaceSummary,
} from "./services/workspace-service";
export {
  defaultRolePermissions,
  type PermissionCode,
  permissionCodes,
  roleHasPermission,
  type WorkspaceRole,
} from "./types/permissions";
