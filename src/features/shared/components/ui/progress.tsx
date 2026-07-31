"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="size-full flex-1 rounded-full bg-primary transition-soft"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
