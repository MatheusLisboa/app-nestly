"use client";

import { LayoutGrid, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/icon";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
};

export type BottomNavMore = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

export interface BottomNavigationProps extends HTMLAttributes<HTMLElement> {
  items: BottomNavItem[];
  more?: BottomNavMore;
}

export function BottomNavigation({ items, more, className, ...props }: BottomNavigationProps) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/92 px-1 pt-1 backdrop-blur-xl md:hidden",
        "pb-[max(0.35rem,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.disabled ? "#" : item.href}
              aria-disabled={item.disabled}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold tracking-tight transition-soft",
                item.active ? "text-primary" : "text-muted-foreground active:text-foreground",
                item.disabled && "pointer-events-none opacity-40",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-soft",
                  item.active && "bg-primary-soft",
                )}
              >
                <Icon icon={item.icon} size="sm" />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          </li>
        ))}
        {more ? (
          <li className="flex-1">
            <button
              type="button"
              onClick={more.onClick}
              aria-current={more.active ? "page" : undefined}
              className={cn(
                "flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold tracking-tight transition-soft",
                more.active ? "text-primary" : "text-muted-foreground active:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-soft",
                  more.active && "bg-primary-soft",
                )}
              >
                <Icon icon={LayoutGrid} size="sm" />
              </span>
              <span className="max-w-full truncate">{more.label}</span>
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
