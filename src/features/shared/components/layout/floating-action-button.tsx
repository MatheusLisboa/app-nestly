"use client";

import { Plus } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/icon";

export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: string;
}

export function FloatingActionButton({
  className,
  icon,
  label = "Adicionar",
  ...props
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "fixed z-30 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow transition-soft hover:brightness-110 active:scale-95",
        "bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6",
        className,
      )}
      {...props}
    >
      {icon ?? <Icon icon={Plus} size="md" />}
    </button>
  );
}
