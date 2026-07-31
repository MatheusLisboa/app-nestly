"use client";

import type { ComponentProps } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { cn } from "@/lib/utils";

export const Drawer = VaulDrawer.Root;
export const DrawerTrigger = VaulDrawer.Trigger;
export const DrawerClose = VaulDrawer.Close;
export const DrawerPortal = VaulDrawer.Portal;

export function DrawerOverlay({ className, ...props }: ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay className={cn("fixed inset-0 z-50 bg-overlay", className)} {...props} />
  );
}

export function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof VaulDrawer.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <VaulDrawer.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-2xl border border-border bg-popover text-popover-foreground shadow-lg outline-none",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border" aria-hidden />
        <div className="overflow-y-auto p-5 pb-8">{children}</div>
      </VaulDrawer.Content>
    </DrawerPortal>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof VaulDrawer.Title>) {
  return (
    <VaulDrawer.Title
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof VaulDrawer.Description>) {
  return (
    <VaulDrawer.Description className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
