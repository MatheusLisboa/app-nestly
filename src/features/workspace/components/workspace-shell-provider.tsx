"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { SessionUser } from "@/features/auth/services/session";
import type { WorkspaceSummary } from "@/features/workspace/services/workspace-service";

type WorkspaceShellContextValue = {
  user: SessionUser | null;
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
};

const WorkspaceShellContext = createContext<WorkspaceShellContextValue>({
  user: null,
  workspaces: [],
  activeWorkspace: null,
});

export function WorkspaceShellProvider({
  children,
  user,
  workspaces,
  activeWorkspace,
}: WorkspaceShellContextValue & { children: ReactNode }) {
  return (
    <WorkspaceShellContext.Provider value={{ user, workspaces, activeWorkspace }}>
      {children}
    </WorkspaceShellContext.Provider>
  );
}

export function useWorkspaceShell() {
  return useContext(WorkspaceShellContext);
}
