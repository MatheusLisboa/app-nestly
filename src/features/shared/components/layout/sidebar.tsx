import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

/**
 * Desktop rail: compact icons on md–lg, full labels from lg up.
 * Hidden on mobile (bottom nav + drawer handle modules).
 */
export function Sidebar({ header, footer, className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "group/sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur-xl",
        "md:flex md:w-[4.75rem] lg:w-64 xl:w-[17rem]",
        className,
      )}
      {...props}
    >
      {header ? (
        <div className="shrink-0 border-b border-sidebar-border/70 p-2 lg:p-3">{header}</div>
      ) : null}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 lg:p-2.5">{children}</div>
      {footer ? (
        <div className="shrink-0 border-t border-sidebar-border p-2 lg:p-3">{footer}</div>
      ) : null}
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
  title,
  ...props
}: SidebarNavItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl text-sm tracking-tight transition-soft",
        "justify-center px-0 py-2.5 md:min-h-11 lg:justify-start lg:px-3",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-xs"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70",
        disabled && "pointer-events-none cursor-not-allowed opacity-45",
        className,
      )}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      title={title}
      {...props}
    >
      {icon ? (
        <span className="shrink-0 text-current [&_svg]:size-[1.15rem] lg:[&_svg]:size-4">{icon}</span>
      ) : null}
      <span className="hidden min-w-0 truncate lg:inline">{children}</span>
    </div>
  );
}
