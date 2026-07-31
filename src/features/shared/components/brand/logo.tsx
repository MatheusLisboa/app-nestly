import Image from "next/image";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** mark = icon only; full = mark + wordmark */
  variant?: "mark" | "full";
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
};

const markSize = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
} as const;

/**
 * Brand mark / wordmark. Prefer this over hardcoding letters or raw paths.
 * Uses the raster icon for Next Image optimization (SVG stays available for favicon/PWA).
 */
export function Logo({ className, variant = "full", size = "md", priority }: LogoProps) {
  const px = markSize[size];

  const mark = (
    <Image
      src={brand.assets.icon192}
      alt={variant === "mark" ? brand.name : ""}
      width={px}
      height={px}
      priority={priority}
      className={cn("shrink-0 rounded-[22%] shadow-xs", variant === "mark" && className)}
      aria-hidden={variant === "full" ? true : undefined}
    />
  );

  if (variant === "mark") {
    return mark;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark}
      <span
        className={cn(
          "font-extrabold tracking-tight text-foreground",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl",
          size === "xl" && "text-3xl",
        )}
      >
        {brand.name}
      </span>
    </span>
  );
}
