"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "@/config/env";
import { registerBabyOfflineAdapter } from "@/features/baby/offline/adapter";
import { registerBillsOfflineAdapter } from "@/features/bills/offline/adapter";
import { registerCalendarOfflineAdapter } from "@/features/calendar/offline/adapter";
import { registerChecklistsOfflineAdapter } from "@/features/checklists/offline/adapter";
import { registerCleaningOfflineAdapter } from "@/features/cleaning/offline/adapter";
import { registerInventoryOfflineAdapter } from "@/features/inventory/offline/adapter";
import { registerShoppingOfflineAdapter } from "@/features/shopping/offline/adapter";
import { useWorkspaceShell } from "@/features/workspace/components/workspace-shell-provider";
import { runSyncCycle } from "@/lib/offline";

/**
 * Boots offline adapters and runs sync when online / focused.
 */
export function OfflineBootstrap() {
  const { activeWorkspace } = useWorkspaceShell();

  useEffect(() => {
    registerShoppingOfflineAdapter();
    registerInventoryOfflineAdapter();
    registerChecklistsOfflineAdapter();
    registerCleaningOfflineAdapter();
    registerBillsOfflineAdapter();
    registerCalendarOfflineAdapter();
    registerBabyOfflineAdapter();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !activeWorkspace) return;

    const workspaceId = activeWorkspace.id;

    async function sync() {
      if (!navigator.onLine) return;
      try {
        await runSyncCycle(workspaceId);
      } catch {
        // Silent — sync retries on next online/focus.
      }
    }

    void sync();

    window.addEventListener("online", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("focus", sync);
    };
  }, [activeWorkspace]);

  return null;
}
