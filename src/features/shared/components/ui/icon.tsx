import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

const iconSizes = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
} as const;

export type IconSize = keyof typeof iconSizes;

export interface IconProps extends Omit<LucideProps, "ref"> {
  icon: LucideIcon;
  size?: IconSize;
}

/**
 * Canonical Lucide wrapper — keeps stroke, size and alignment consistent.
 */
export function Icon({ icon: Glyph, size = "sm", className, ...props }: IconProps) {
  return (
    <Glyph
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn("shrink-0", iconSizes[size], className)}
      strokeWidth={1.75}
      {...props}
    />
  );
}
