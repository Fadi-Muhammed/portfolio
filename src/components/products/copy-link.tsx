"use client";

import { useEffect, useState } from "react";

/**
 * Copies the current page's URL.
 *
 * The button keeps its name through the flow, as B12 requires: "Copy link" becomes
 * "Link copied", not a checkmark that leaves the visitor guessing what happened. It
 * returns to its own name after a moment so the control is never stuck reporting.
 *
 * Rendered as a plain button rather than hidden when the clipboard is unavailable: on
 * the rare browser that refuses, the failure is reported in the same place, which is
 * more use than a control that quietly is not there.
 */
export function CopyLink() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2_000);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button type="button" onClick={copy} className="detail__copy">
      {state === "copied" ? "Link copied" : state === "failed" ? "Could not copy" : "Copy link"}
    </button>
  );
}
