"use client";

import { X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  selected?: boolean;
  onRemove?: () => void;
  leading?: ReactNode;
}

export function Chip({
  className,
  selected,
  onRemove,
  leading,
  children,
  onClick,
  ...props
}: ChipProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-full border text-xs font-medium tracking-tight transition-soft",
        selected
          ? "border-primary/30 bg-primary-soft text-primary"
          : "border-border bg-surface-elevated text-foreground",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex h-full items-center gap-1.5 rounded-full px-3 transition-soft",
          !selected && "hover:bg-muted",
        )}
        aria-pressed={selected}
        onClick={onClick}
        {...props}
      >
        {leading}
        <span>{children}</span>
      </button>
      {onRemove ? (
        <button
          type="button"
          className="mr-1 inline-flex size-5 items-center justify-center rounded-full hover:bg-foreground/10"
          onClick={onRemove}
          aria-label="Remover"
        >
          <Icon icon={X} size="xs" />
        </button>
      ) : null}
    </div>
  );
}
