import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer" and announces that it does. */
  external?: boolean;
  children: ReactNode;
};

const base = cn(
  "text-accent underline decoration-1 underline-offset-4",
  "transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease)]",
  "hover:decoration-2",
);

export function Link({ href, external = false, className, children, ...props }: LinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, className)}
        {...props}
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <NextLink href={href} className={cn(base, className)} {...props}>
      {children}
    </NextLink>
  );
}
