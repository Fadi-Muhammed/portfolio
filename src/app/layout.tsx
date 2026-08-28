import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fadi Muhammed",
  // The site is a holding page until launch. Part 15 sets the real metadata and
  // Part 17 removes this, so "Building. Back soon." is never what gets indexed.
  robots: { index: false, follow: false },
};

// Typed explicitly rather than with Next's generated LayoutProps<"/">: those types
// are emitted into .next/types by a build, so `npm run typecheck` — which CI runs
// before the build — would fail on a clean checkout.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
