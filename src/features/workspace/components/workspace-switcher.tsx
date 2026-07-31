"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { switchWorkspaceAction } from "@/features/workspace/actions/workspace-actions";
import type { WorkspaceSummary } from "@/features/workspace/services/workspace-service";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  active: WorkspaceSummary | null;
}

export function WorkspaceSwitcher({ workspaces, active }: WorkspaceSwitcherProps) {
  const t = useTranslations("workspace");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSelect(workspaceId: string) {
    if (workspaceId === active?.id) return;

    startTransition(async () => {
      const result = await switchWorkspaceAction({ workspaceId });
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-between gap-2 px-2 py-2 text-left"
          disabled={pending}
          aria-label={t("switch")}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight">
              {active?.name ?? t("displayName")}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{t("switch")}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 min-w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-soft"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs text-muted-foreground">
            {t("displayNamePlural")}
          </DropdownMenu.Label>

          {workspaces.map((workspace) => (
            <DropdownMenu.Item
              key={workspace.id}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-muted",
              )}
              onSelect={() => onSelect(workspace.id)}
            >
              <span className="truncate">{workspace.name}</span>
              {workspace.id === active?.id ? (
                <Check className="size-4 text-primary" aria-hidden />
              ) : null}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item asChild>
            <Link
              href="/onboarding"
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-muted"
            >
              <Plus className="size-4" aria-hidden />
              {t("create")}
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
