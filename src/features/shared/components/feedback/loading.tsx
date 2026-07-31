import { Loader2 } from "lucide-react";
import type { HTMLAttributes } from "react";
import { Icon } from "@/features/shared/components/ui/icon";
import { cn } from "@/lib/utils";

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "xs" as const,
  md: "sm" as const,
  lg: "md" as const,
};

export function Loading({ className, label = "Carregando…", size = "md", ...props }: LoadingProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 text-muted-foreground", className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <Icon icon={Loader2} size={sizeMap[size]} className="animate-spin text-primary" />
      <span className="text-sm tracking-tight">{label}</span>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Icon
      icon={Loader2}
      size="sm"
      className={cn("animate-spin text-primary", className)}
      aria-label="Carregando"
    />
  );
}
