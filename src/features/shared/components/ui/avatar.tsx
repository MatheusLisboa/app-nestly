"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
  xl: "size-14 text-base",
} as const;

export interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root> {
  size?: keyof typeof sizeMap;
}

export function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
        sizeMap[size],
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center bg-secondary font-medium text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}
