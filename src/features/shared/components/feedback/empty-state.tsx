import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export function EmptyStateAction({ children, ...props }: React.ComponentProps<typeof Button>) {
  return <Button {...props}>{children}</Button>;
}
