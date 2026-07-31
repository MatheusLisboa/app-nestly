import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent dark:after:via-white/5",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
