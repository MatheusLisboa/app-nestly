import { Slot } from "@radix-ui/react-slot";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

export function Input({ className, asChild = false, type = "text", ...props }: InputProps) {
  const Comp = asChild ? Slot : "input";

  return (
    <Comp
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-surface-elevated px-3.5 py-2 text-base tracking-tight text-foreground shadow-xs transition-soft placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
