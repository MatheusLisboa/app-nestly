import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}

export function Section({
  title,
  description,
  action,
  eyebrow,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("space-y-5", className)} {...props}>
      {(title || description || action || eyebrow) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
