import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { designRouteEnabled } from "@/lib/flags";
import { DesignShowcase } from "./design-showcase";

export const metadata: Metadata = {
  title: "Design system — Fadi Muhammed",
  robots: { index: false, follow: false },
};

/**
 * The token playground. Gated on NEXT_PUBLIC_ENABLE_DESIGN_ROUTE so it can be turned
 * on for the deployed site during a design review and is otherwise absent — checking
 * it on a real phone is the point, and that needs a real URL.
 */
export default function DesignPage() {
  if (!designRouteEnabled) notFound();
  return <DesignShowcase />;
}
