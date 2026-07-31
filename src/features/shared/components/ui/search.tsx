"use client";

import { Search as SearchIcon, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
  containerClassName?: string;
}

export function Search({ className, containerClassName, onClear, value, ...props }: SearchProps) {
  const showClear = Boolean(onClear && value);

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Icon
        icon={SearchIcon}
        size="sm"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={value}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-surface-elevated py-2 pl-9 pr-10 text-sm tracking-tight text-foreground shadow-xs transition-soft placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={onClear}
          aria-label="Limpar busca"
        >
          <Icon icon={X} size="xs" />
        </Button>
      ) : null}
    </div>
  );
}
