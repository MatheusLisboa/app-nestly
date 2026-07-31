import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  htmlFor,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
