import { cookies } from "next/headers";
import { appConfig } from "@/config/app";

export async function getActiveWorkspaceIdFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(appConfig.activeWorkspaceCookie)?.value ?? null;
}

export async function setActiveWorkspaceCookie(workspaceId: string): Promise<void> {
  const jar = await cookies();
  jar.set(appConfig.activeWorkspaceCookie, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveWorkspaceCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(appConfig.activeWorkspaceCookie);
}
