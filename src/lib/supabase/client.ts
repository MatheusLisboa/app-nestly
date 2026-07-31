import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicCredentials } from "@/lib/supabase/credentials";

/**
 * Browser Supabase client (anon key).
 * Must use createBrowserClient so the PKCE code verifier is stored in cookies
 * and can be read by the /auth/callback Route Handler.
 */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicCredentials();

  return createBrowserClient(url, anonKey);
}
