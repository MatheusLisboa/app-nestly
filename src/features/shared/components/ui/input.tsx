import { Slot } from "@radix-ui/react-slot";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const DATE_TYPES = new Set(["date", "datetime-local", "time", "month", "week"]);

export function Input({ className, asChild = false, type = "text", ...props }: InputProps) {
  const Comp = asChild ? Slot : "input";
  const isDateLike = DATE_TYPES.has(type);

  return (
    <Comp
      type={type}
      className={cn(
        "flex h-11 w-full min-w-0 max-w-full rounded-xl border border-input bg-surface-elevated px-3.5 py-2 text-base tracking-tight text-foreground shadow-xs transition-soft placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        // Native date pickers have a large intrinsic width on iOS/WebKit and overflow grids.
        isDateLike &&
          "appearance-none [-webkit-appearance:none] [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:min-w-0 [&::-webkit-datetime-edit]:max-w-full [&::-webkit-datetime-edit]:p-0",
        className,
      )}
      {...props}
    />
  );
}
