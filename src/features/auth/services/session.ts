import type { User } from "@supabase/supabase-js";
import { DomainError } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

function sessionFromAuthUser(user: User): SessionUser {
  const email = user.email?.toLowerCase() ?? "";
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email.split("@")[0] ??
    null;
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

  return {
    id: user.id,
    email,
    displayName,
    avatarUrl,
  };
}

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function requireAuthUser(): Promise<User> {
  const user = await getAuthUser();

  if (!user) {
    throw new DomainError("UNAUTHORIZED", "Você precisa estar autenticado.", 401);
  }

  return user;
}

/**
 * Ensures a profiles row exists for the authenticated user (idempotent).
 * Falls back to auth metadata if the profiles table is not available yet.
 */
export async function ensureProfile(user: User): Promise<SessionUser> {
  const fallback = sessionFromAuthUser(user);

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: fallback.email,
          display_name: fallback.displayName,
          avatar_url: fallback.avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("id, email, display_name, avatar_url")
      .single();

    if (error || !data) {
      return fallback;
    }

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
    };
  } catch {
    return fallback;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return ensureProfile(user);
}
