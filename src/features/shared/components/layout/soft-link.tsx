"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, type MouseEvent, useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";

type SoftLinkProps = ComponentProps<typeof Link>;

/**
 * App-shell navigation link with instant visual feedback and soft transition.
 * Prefers the View Transitions API when available.
 */
export function SoftLink({ href, className, onClick, children, ...props }: SoftLinkProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (typeof href !== "string" || href.startsWith("http") || href.startsWith("#")) return;

      event.preventDefault();

      const navigate = () => {
        startTransition(() => {
          router.push(href);
        });
      };

      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => void;
      };

      if (typeof doc.startViewTransition === "function") {
        doc.startViewTransition(navigate);
      } else {
        navigate();
      }
    },
    [href, onClick, router],
  );

  return (
    <Link
      href={href}
      prefetch
      onClick={handleClick}
      className={cn("transition-transform duration-150 ease-out active:scale-[0.97]", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
