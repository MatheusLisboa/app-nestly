import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  sticky?: boolean;
};

export function Header({
  title,
  leading,
  trailing,
  sticky = true,
  className,
  children,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/80 px-3 backdrop-blur-xl sm:px-4 md:px-6",
        sticky && "sticky top-0 z-20",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {leading}
        {title ? (
          <div className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">
            {title}
          </div>
        ) : null}
        {children}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-0.5">{trailing}</div> : null}
    </header>
  );
}
