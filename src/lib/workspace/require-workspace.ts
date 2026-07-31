/**
 * Shared helpers for workspace-scoped feature services.
 */
import { ensureProfile, requireAuthUser } from "@/features/auth/services/session";
import { resolveActiveWorkspace, type WorkspaceSummary } from "@/features/workspace";
import { type PermissionCode, roleHasPermission } from "@/features/workspace/types/permissions";
import { DomainError } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireActiveWorkspaceContext(permission?: PermissionCode) {
  const user = await requireAuthUser();
  await ensureProfile(user);
  const workspace = await resolveActiveWorkspace();

  if (!workspace) {
    throw new DomainError("NO_WORKSPACE", "Nenhuma família ativa.", 400);
  }

  if (permission && !roleHasPermission(workspace.role, permission)) {
    throw new DomainError("FORBIDDEN", "Sem permissão para esta ação.", 403);
  }

  const supabase = await createServerSupabaseClient();

  return { user, workspace, supabase };
}

export type WorkspaceContext = {
  user: Awaited<ReturnType<typeof requireAuthUser>>;
  workspace: WorkspaceSummary;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
};
