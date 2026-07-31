import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/config/env";
import { getSupabasePublicCredentials } from "@/lib/supabase/credentials";

export type SessionMiddlewareResult = {
  response: NextResponse;
  user: User | null;
};

/**
 * Refreshes the auth session on each matched request.
 * Keeps Server Components in sync with cookies.
 */
export async function updateSession(request: NextRequest): Promise<SessionMiddlewareResult> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!isSupabaseConfigured()) {
    return { response, user: null };
  }

  const { url, anonKey } = getSupabasePublicCredentials();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
