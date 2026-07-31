import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicCredentials } from "@/lib/supabase/credentials";

/**
 * Server Supabase client with cookie-based session.
 * RLS applies as the authenticated user.
 */
export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabasePublicCredentials();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware will refresh sessions.
        }
      },
    },
  });
}
