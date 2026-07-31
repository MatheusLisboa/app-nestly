import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-tight transition-soft disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:brightness-110 hover:shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border bg-surface-elevated/60 text-foreground shadow-xs hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        soft: "bg-primary-soft text-primary hover:bg-primary/15",
        accent: "bg-accent text-accent-foreground shadow-xs hover:brightness-110",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:brightness-110",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-xs",
        default: "h-11 rounded-xl px-4 text-[0.9375rem]",
        lg: "h-12 rounded-xl px-5 text-base",
        xl: "h-14 rounded-2xl px-6 text-base",
        icon: "size-11 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
