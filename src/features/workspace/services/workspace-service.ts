import { randomBytes } from "node:crypto";
import { ensureProfile, requireAuthUser } from "@/features/auth/services/session";
import type { WorkspaceRole } from "@/features/workspace/types/permissions";
import { uniqueSlug } from "@/features/workspace/utils/slug";
import { DomainError } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  clearActiveWorkspaceCookie,
  getActiveWorkspaceIdFromCookie,
  setActiveWorkspaceCookie,
} from "./active-workspace";

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

export type WorkspaceMemberView = {
  userId: string;
  role: WorkspaceRole;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  joinedAt: string;
};

function mapRole(role: string): WorkspaceRole {
  if (role === "owner" || role === "admin" || role === "member" || role === "viewer") {
    return role;
  }
  return "member";
}

export async function listUserWorkspaces(): Promise<WorkspaceSummary[]> {
  const user = await requireAuthUser();
  await ensureProfile(user);
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(id, name, slug)")
    .eq("user_id", user.id);

  if (error) {
    throw new DomainError("WORKSPACE_LIST_FAILED", error.message);
  }

  return (data ?? [])
    .map((row) => {
      const workspace = row.workspace as
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null;

      const ws = Array.isArray(workspace) ? workspace[0] : workspace;
      if (!ws) return null;

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        role: mapRole(row.role),
      } satisfies WorkspaceSummary;
    })
    .filter((item): item is WorkspaceSummary => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function resolveActiveWorkspace(): Promise<WorkspaceSummary | null> {
  const workspaces = await listUserWorkspaces();
  if (workspaces.length === 0) {
    await clearActiveWorkspaceCookie();
    return null;
  }

  const cookieId = await getActiveWorkspaceIdFromCookie();
  const active = workspaces.find((ws) => ws.id === cookieId) ?? workspaces[0];

  if (!active) {
    return null;
  }

  if (cookieId !== active.id) {
    await setActiveWorkspaceCookie(active.id);
  }

  return active;
}

export async function createWorkspace(name: string): Promise<WorkspaceSummary> {
  const user = await requireAuthUser();
  await ensureProfile(user);
  const supabase = await createServerSupabaseClient();

  const suffix = randomBytes(3).toString("hex");
  const slug = uniqueSlug(name, suffix);

  // Atomic RPC avoids RLS chicken-and-egg (insert workspace before membership exists)
  const { data: workspace, error: workspaceError } = await supabase.rpc("create_workspace", {
    p_name: name,
    p_slug: slug,
  });

  if (workspaceError || !workspace) {
    throw new DomainError(
      "WORKSPACE_CREATE_FAILED",
      workspaceError?.message ?? "Não foi possível criar a família.",
    );
  }

  const row = workspace as { id: string; name: string; slug: string };

  await setActiveWorkspaceCookie(row.id);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    role: "owner",
  };
}

export async function switchWorkspace(workspaceId: string): Promise<WorkspaceSummary> {
  const workspaces = await listUserWorkspaces();
  const target = workspaces.find((ws) => ws.id === workspaceId);

  if (!target) {
    throw new DomainError("WORKSPACE_FORBIDDEN", "Você não participa desta família.", 403);
  }

  await setActiveWorkspaceCookie(target.id);
  return target;
}

export async function inviteMember(input: {
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
}): Promise<{ id: string; token: string }> {
  const user = await requireAuthUser();
  const workspaces = await listUserWorkspaces();
  const current = workspaces.find((ws) => ws.id === input.workspaceId);

  if (!current || (current.role !== "owner" && current.role !== "admin")) {
    throw new DomainError("WORKSPACE_FORBIDDEN", "Sem permissão para convidar.", 403);
  }

  const supabase = await createServerSupabaseClient();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const { data, error } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: input.workspaceId,
      email: input.email,
      role: input.role,
      token,
      status: "pending",
      invited_by: user.id,
      expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error || !data) {
    throw new DomainError("INVITE_FAILED", error?.message ?? "Falha ao criar convite.");
  }

  return { id: data.id, token: data.token };
}

export async function acceptInvitation(token: string): Promise<WorkspaceSummary> {
  const user = await requireAuthUser();
  await ensureProfile(user);
  const supabase = await createServerSupabaseClient();

  const { data: invite, error } = await supabase
    .from("workspace_invitations")
    .select("id, workspace_id, email, role, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !invite) {
    throw new DomainError("INVITE_NOT_FOUND", "Convite inválido ou expirado.", 404);
  }

  if (invite.status !== "pending") {
    throw new DomainError("INVITE_USED", "Este convite já foi utilizado.");
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    throw new DomainError("INVITE_EXPIRED", "Este convite expirou.");
  }

  const userEmail = user.email?.toLowerCase();
  if (!userEmail || userEmail !== invite.email.toLowerCase()) {
    throw new DomainError(
      "INVITE_EMAIL_MISMATCH",
      "Entre com o e-mail que recebeu o convite.",
      403,
    );
  }

  const role = mapRole(invite.role === "owner" ? "member" : invite.role);

  const { error: memberError } = await supabase.from("workspace_members").upsert({
    workspace_id: invite.workspace_id,
    user_id: user.id,
    role,
  });

  if (memberError) {
    throw new DomainError("WORKSPACE_MEMBER_FAILED", memberError.message);
  }

  await supabase.from("workspace_invitations").update({ status: "accepted" }).eq("id", invite.id);

  await setActiveWorkspaceCookie(invite.workspace_id);

  const workspaces = await listUserWorkspaces();
  const joined = workspaces.find((ws) => ws.id === invite.workspace_id);

  if (!joined) {
    throw new DomainError("WORKSPACE_JOIN_FAILED", "Não foi possível entrar na família.");
  }

  return joined;
}

export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberView[]> {
  const workspaces = await listUserWorkspaces();
  if (!workspaces.some((ws) => ws.id === workspaceId)) {
    throw new DomainError("WORKSPACE_FORBIDDEN", "Sem acesso a esta família.", 403);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at, profile:profiles(email, display_name, avatar_url)")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new DomainError("MEMBERS_LIST_FAILED", error.message);
  }

  return (data ?? []).map((row) => {
    const profile = row.profile as
      | { email: string; display_name: string | null; avatar_url: string | null }
      | { email: string; display_name: string | null; avatar_url: string | null }[]
      | null;
    const p = Array.isArray(profile) ? profile[0] : profile;

    return {
      userId: row.user_id,
      role: mapRole(row.role),
      email: p?.email ?? "",
      displayName: p?.display_name ?? null,
      avatarUrl: p?.avatar_url ?? null,
      joinedAt: row.joined_at,
    };
  });
}
