import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight transition-soft",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent-soft text-accent",
        outline: "border border-border text-foreground",
        success: "bg-primary-soft text-primary",
        warning: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-warning",
        destructive: "bg-[color-mix(in_oklab,var(--destructive)_16%,transparent)] text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
