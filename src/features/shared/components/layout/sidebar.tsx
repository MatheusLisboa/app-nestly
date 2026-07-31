import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ header, footer, className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-dvh w-[16.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur-xl md:flex lg:w-64",
        className,
      )}
      {...props}
    >
      {header ? <div className="shrink-0 p-2">{header}</div> : null}
      <div className="flex-1 overflow-y-auto p-2">{children}</div>
      {footer ? <div className="shrink-0 border-t border-sidebar-border p-2">{footer}</div> : null}
    </aside>
  );
}

export interface SidebarNavItemProps extends HTMLAttributes<HTMLElement> {
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  asChild?: boolean;
}

export function SidebarNavItem({
  className,
  active,
  disabled,
  icon,
  children,
  ...props
}: SidebarNavItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm tracking-tight transition-soft",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-xs"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70",
        disabled && "pointer-events-none cursor-not-allowed opacity-45",
        className,
      )}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {icon ? <span className="shrink-0 text-current [&_svg]:size-4">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </div>
  );
}
