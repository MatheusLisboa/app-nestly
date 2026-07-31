import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/config/env";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = ["/login", "/auth/callback", "/invite"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Auth gate + session refresh.
 * Workspace membership is enforced in (app) layout (needs DB).
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (!isSupabaseConfigured()) {
    // Local foundation without Supabase: allow browsing unprotected.
    return response;
  }

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|sw.js|manifest.webmanifest).*)",
  ],
};
