"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("w-full", className)} {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex h-auto min-h-11 w-full items-center gap-1 overflow-x-auto rounded-2xl bg-muted/80 p-1 text-muted-foreground",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold tracking-tight",
        "transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
        "data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:shadow-xs",
        "hover:text-foreground active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  forceMount,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      forceMount={forceMount ?? true}
      className={cn(
        "mt-4 outline-none focus-visible:ring-0",
        // Keep panels mounted for instant switches; hide inactive with CSS.
        "data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:invisible data-[state=inactive]:h-0 data-[state=inactive]:overflow-hidden data-[state=inactive]:opacity-0",
        "data-[state=active]:relative data-[state=active]:animate-tab-in",
        className,
      )}
      {...props}
    />
  );
}
