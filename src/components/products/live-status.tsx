"use client";

import { useEffect, useState } from "react";
import type { StatusResponse } from "@/app/api/status/route";

/**
 * The live reading on a product card: an LED that settles to "live · 84 ms".
 *
 * It is asked for once, when the card first comes into view, and never again — B5 is
 * explicit that live pings happen once rather than continuously, and a card that polled
 * would put traffic on someone else's server for as long as the tab stayed open.
 *
 * Three states, all designed. Checking, while the request is out. A reading, with the
 * measured round trip. And unreachable, which is a real answer about the product rather
 * than an error about the site — B10 asks for "Endpoint unreachable" and gives the
 * visitor the demo instead, which is why this never looks like a failure of the page.
 */

type State =
  { kind: "idle" } | { kind: "checking" } | { kind: "up"; ms: number | null } | { kind: "down" };

export function LiveStatus({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    // Nothing is measured until the card is actually on screen. Below the fold on a
    // filmstrip, most cards are never looked at.
    let cancelled = false;
    const controller = new AbortController();

    async function check() {
      setState({ kind: "checking" });
      try {
        const response = await fetch(`/api/status?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const result = (await response.json()) as StatusResponse;
        if (!cancelled) setState(result.ok ? { kind: "up", ms: result.ms } : { kind: "down" });
      } catch {
        if (!cancelled) setState({ kind: "down" });
      }
    }

    void check();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  if (state.kind === "idle") return null;

  const label =
    state.kind === "checking"
      ? "Checking…"
      : state.kind === "up"
        ? state.ms === null
          ? "Live"
          : `Live · ${state.ms} ms`
        : "Endpoint unreachable";

  return (
    <p className="live-status text-data" data-state={state.kind}>
      <span className="live-status__led" aria-hidden="true" />
      {/* The reading is announced once it settles, not while it is in flight: a screen
          reader user does not need "checking" read out on every card. */}
      <span aria-live={state.kind === "checking" ? "off" : "polite"}>{label}</span>
    </p>
  );
}
