import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/config/app";
import { getSupabasePublicCredentials } from "@/lib/supabase/credentials";

/**
 * Exchanges the auth code (or email token_hash) for a session and redirects.
 * Cookies are written onto the redirect response so the browser keeps the session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const nextRaw = searchParams.get("next") ?? "/";
  const next = nextRaw.startsWith("/") ? nextRaw : "/";

  if (errorParam) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", errorDescription || errorParam);
    return NextResponse.redirect(loginUrl);
  }

  const { url, anonKey } = getSupabasePublicCredentials();

  let redirectResponse = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        redirectResponse = NextResponse.redirect(new URL(next, origin));
        for (const { name, value, options } of cookiesToSet) {
          redirectResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  async function attachActiveWorkspaceCookie(userId: string) {
    try {
      const existing = request.cookies.get(appConfig.activeWorkspaceCookie)?.value;
      const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId);

      const ids = (memberships ?? []).map((row) => row.workspace_id as string);
      if (ids.length === 0) return;

      const workspaceId =
        existing && ids.includes(existing) ? existing : (ids[0] as string);
      redirectResponse.cookies.set(appConfig.activeWorkspaceCookie, workspaceId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } catch {
      // ignore — resolveActiveWorkspace falls back to first membership
    }
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", error?.message ?? "auth_callback");
      return NextResponse.redirect(loginUrl);
    }

    // Best-effort profile upsert (ignore if tables not ready)
    try {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email?.toLowerCase() ?? "",
          display_name:
            (data.user.user_metadata?.full_name as string | undefined) ??
            (data.user.user_metadata?.name as string | undefined) ??
            data.user.email?.split("@")[0] ??
            null,
          avatar_url: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    } catch {
      // ignore
    }

    await attachActiveWorkspaceCookie(data.user.id);
    return redirectResponse;
  }

  // Fallback for email links that use token_hash (OTP verify)
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as "email" | "magiclink" | "signup" | "invite" | "recovery" | "email_change",
      token_hash: tokenHash,
    });

    if (error) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }

    if (data.user) {
      await attachActiveWorkspaceCookie(data.user.id);
    }

    return redirectResponse;
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "missing_code");
  return NextResponse.redirect(loginUrl);
}
