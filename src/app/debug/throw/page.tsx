import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Throw — debug",
  robots: { index: false, follow: false },
};

/**
 * A route that fails on purpose, so the render error page can be seen and tested.
 *
 * Development only, gated the same way `/debug/content` is: on NODE_ENV rather than on a
 * flag, because a flag can be switched on in production by accident and this route has no
 * business existing there at all.
 *
 * `force-dynamic` so the throw happens on request rather than at build time, where it
 * would fail the build instead of exercising the boundary.
 */
export const dynamic = "force-dynamic";

export default function DebugThrow() {
  if (process.env.NODE_ENV === "production") notFound();
  throw new Error("Deliberate failure from /debug/throw, to exercise the error boundary.");
}
