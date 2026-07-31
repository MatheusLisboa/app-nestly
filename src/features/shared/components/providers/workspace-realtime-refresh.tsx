"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { isSupabaseConfigured } from "@/config/env";
import { useWorkspaceShell } from "@/features/workspace/components/workspace-shell-provider";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const POLL_MS = 45_000;
const DEBOUNCE_MS = 800;

const REALTIME_TABLES = [
  "shopping_items",
  "shopping_lists",
  "bills",
  "cleaning_tasks",
  "calendar_events",
  "baby_medical_appointments",
  "baby_care_logs",
  "babies",
  "inventory_items",
  "checklist_items",
] as const;

/**
 * Keeps the app shell fresh across devices:
 * - Supabase Realtime on workspace tables (when available)
 * - Light poll + focus refresh as fallback
 */
export function WorkspaceRealtimeRefresh() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceShell();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !activeWorkspace) return;

    const workspaceId = activeWorkspace.id;

    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        router.refresh();
      }, DEBOUNCE_MS);
    };

    const supabase = createBrowserSupabaseClient();
    const channel = supabase.channel(`nestly-workspace-${workspaceId}`);

    for (const table of REALTIME_TABLES) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          refresh();
        },
      );
    }

    channel.subscribe();

    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, POLL_MS);

    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      void supabase.removeChannel(channel);
    };
  }, [activeWorkspace, router]);

  return null;
}
