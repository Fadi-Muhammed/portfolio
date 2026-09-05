"use client";

import { useSyncExternalStore } from "react";

/**
 * "No signal." (B10) — an overlay, not a page.
 *
 * A page would be the wrong shape. Losing connectivity does not undo what the visitor is
 * reading: the section they are on is already in the document and stays readable, and
 * throwing it away to announce the loss would cost them their place to tell them
 * something they can be told in a corner. So this is a panel over the site, it does not
 * take focus, and it does not dim anything.
 *
 * B10 asks it to retry automatically and to confirm before returning, and both of those
 * are the same problem: `navigator.onLine` is only trustworthy in one direction. False
 * means there is no interface and is reliable. True means an interface exists, which is
 * not the same as being able to reach anything — a captive portal, a router with no
 * uplink, and a laptop on a dead hotspot all report true. So the store treats the offline
 * event as fact, and treats coming back as a claim to be checked: it asks the network for
 * something real before it says the signal is back.
 *
 * The probe is a HEAD of the current URL rather than /api/health, which reports on the
 * database as well and answers 503 wherever Supabase is unconfigured — that would read as
 * "still offline" on a machine with a perfectly good connection. The question here is
 * only whether a request reaches anything at all, and any answer at all settles it.
 *
 * No drawing. The no-signal figure was in this panel and was removed: at the width a
 * corner panel can spare it was a row of dots that read as a dotted line rather than as a
 * broken route, and a drawing nobody can decode is decoration. The full-page states have
 * the room to draw; this one has the words.
 *
 * The whole state machine, timer included, lives in the store rather than in the
 * component. That is not only the lint rule about setState in an effect, though it is
 * that too: how long "Signal restored." stays on screen is a fact about the connection
 * being watched, not about the panel drawing it, and the component that renders it has no
 * business owning it.
 */

const PROBE_MS = 5_000;
/** How long "Signal restored." stays before the panel removes itself. */
const RESTORED_MS = 2_400;

type Signal = "ok" | "lost" | "restored";

let signal: Signal = "ok";
let watching = false;
let probeTimer: ReturnType<typeof setInterval> | undefined;
let restoredTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(next: Signal) {
  if (next === signal) return;
  signal = next;
  for (const listener of listeners) listener();
}

function lose() {
  if (signal === "lost") return;
  clearTimeout(restoredTimer);
  set("lost");
  probeTimer ??= setInterval(() => void probe(), PROBE_MS);
}

/**
 * Confirmed contact. Only says so if something was actually lost — otherwise every page
 * load that happened to fire an online event would announce a restoration nobody missed.
 */
function regain() {
  if (signal !== "lost") return;
  clearInterval(probeTimer);
  probeTimer = undefined;
  set("restored");
  restoredTimer = setTimeout(() => set("ok"), RESTORED_MS);
}

async function probe() {
  try {
    await fetch(window.location.href, { method: "HEAD", cache: "no-store" });
    regain();
  } catch {
    // Still nothing. The interval is already running; it will ask again.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!watching) {
    watching = true;
    if (!navigator.onLine) lose();
    window.addEventListener("offline", lose);
    // The browser thinks it is back. Ask the network before believing it.
    window.addEventListener("online", () => void probe());
  }
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => signal;
/** The server cannot know, and rendering the panel into the HTML would be a lie. */
const getServerSnapshot = (): Signal => "ok";

export function SignalWatch() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (state === "ok") return null;

  return (
    <div className="signal" data-state={state} role="status" aria-live="polite">
      {state === "lost" ? (
        <>
          <p className="text-body text-ink">No signal.</p>
          <p className="signal__detail text-small text-muted">
            The connection dropped. Checking every few seconds.
          </p>
        </>
      ) : (
        <p className="text-body text-ink">Signal restored.</p>
      )}
    </div>
  );
}
