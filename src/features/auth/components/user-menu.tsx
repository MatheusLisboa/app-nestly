"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { Button } from "@/features/shared/components/ui/button";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  email: string;
  displayName: string | null;
  className?: string;
}

export function UserMenu({ email, displayName, className }: UserMenuProps) {
  const t = useTranslations("auth");
  const tA11y = useTranslations("a11y");
  const label = displayName || email;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(className)}
          aria-label={tA11y("userMenu")}
        >
          <UserRound />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-soft"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{label}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-muted"
            onSelect={(event) => {
              event.preventDefault();
              void signOutAction();
            }}
          >
            <LogOut className="size-4" aria-hidden />
            {t("signOut")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
