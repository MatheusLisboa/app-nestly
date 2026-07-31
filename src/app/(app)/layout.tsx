import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/config/env";
import { getSessionUser } from "@/features/auth/services/session";
import { AppShell } from "@/features/shared";
import { OfflineBootstrap } from "@/features/shared/components/providers/offline-bootstrap";
import { PwaInstallPrompt } from "@/features/shared/components/providers/pwa-install-prompt";
import { WorkspaceRealtimeRefresh } from "@/features/shared/components/providers/workspace-realtime-refresh";
import { WorkspaceShellProvider } from "@/features/workspace/components/workspace-shell-provider";
import {
  listUserWorkspaces,
  resolveActiveWorkspace,
} from "@/features/workspace/services/workspace-service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <WorkspaceShellProvider user={null} workspaces={[]} activeWorkspace={null}>
        <OfflineBootstrap />
        <AppShell>{children}</AppShell>
      </WorkspaceShellProvider>
    );
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const workspaces = await listUserWorkspaces();
  if (workspaces.length === 0) {
    redirect("/onboarding");
  }

  // Prefer cookie when present; otherwise first membership (no cookie write in RSC).
  const activeWorkspace = await resolveActiveWorkspace();
  if (!activeWorkspace) {
    redirect("/onboarding");
  }

  return (
    <WorkspaceShellProvider user={user} workspaces={workspaces} activeWorkspace={activeWorkspace}>
      <OfflineBootstrap />
      <WorkspaceRealtimeRefresh />
      <PwaInstallPrompt />
      <AppShell>{children}</AppShell>
    </WorkspaceShellProvider>
  );
}
