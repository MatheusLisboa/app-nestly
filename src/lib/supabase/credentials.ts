import { getPublicEnv, isSupabaseConfigured } from "@/config/env";

export function getSupabasePublicCredentials(): {
  url: string;
  anonKey: string;
} {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const env = getPublicEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public credentials are incomplete.");
  }

  return { url, anonKey };
}
