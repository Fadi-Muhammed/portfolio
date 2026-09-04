"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * The Turnstile widget.
 *
 * Rendered explicitly rather than by Cloudflare's automatic scan of the page, because the
 * theme has to be passed at render time and the widget has to be re-created when the
 * visitor switches between light and dark — an automatic widget would keep whichever theme
 * it was born with.
 *
 * The script is injected here rather than by `next/script`, and that is a fix rather than
 * a preference. `strategy="lazyOnload"` waits for the window load event, which fired long
 * before anyone reaches Contact: it is the last stop on the deck, and the section mounts
 * only when it becomes active. The tag was never added and the widget never rendered —
 * except on a direct link to /#contact, where the section happens to mount during the
 * initial load. That is the one path the first screenshot took, which is how it looked
 * fine and was not.
 *
 * When the site key is missing the widget renders nothing and says so quietly in the
 * console. The form still submits, and the server still refuses it — a form that silently
 * stopped working because of an unset variable would be worse than one that fails loudly
 * at the point the message is checked.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
    /** Named in the script URL, and called by Cloudflare once the API is usable. */
    onTurnstileReady?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
/*
 * `onload` rather than `turnstile.ready()`.
 *
 * The API object exists before it is initialised, so announcing on the script's own load
 * event produced a component that called render() and drew nothing. The obvious fix —
 * `turnstile.ready()` — refuses outright on an async script, and says so: "Remove
 * async/defer from the Turnstile api.js script tag before using turnstile.ready()."
 *
 * Dropping async to satisfy it would mean a render-blocking third-party script on a page
 * most visitors never submit anything from. The `onload` parameter is Cloudflare's own
 * answer for exactly this: keep the script async, and be called when it is ready.
 */
const READY_CALLBACK = "onTurnstileReady";
const SCRIPT_SRC = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${READY_CALLBACK}`;

/**
 * Whether Cloudflare's script has arrived, as an external store.
 *
 * A store rather than a piece of state set from an effect, which is what this was first
 * and what the lint rule rightly refused: "has a third-party script finished loading" is
 * the definition of an external system, and `useSyncExternalStore` is how React is told
 * about one. The theme and the URL filter on this site are wired the same way.
 */
let loaded = false;
const listeners = new Set<() => void>();

function announce() {
  loaded = true;
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function ensureScript() {
  if (loaded) return;

  // Already there and already initialised, from an earlier mount of this section.
  if (window.turnstile) {
    announce();
    return;
  }
  if (document.querySelector("script[data-turnstile]")) return;

  window[READY_CALLBACK] = announce;

  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  script.dataset.turnstile = "";
  document.head.appendChild(script);

  // Deliberately never removed: the deck mounts and unmounts this section as the visitor
  // moves, and re-fetching Cloudflare's script each time would be worse than one tag.
}

export function Turnstile() {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const ready = useSyncExternalStore(
    subscribe,
    () => loaded,
    () => false,
  );
  const { theme } = useTheme();

  useEffect(() => {
    if (SITE_KEY) ensureScript();
  }, []);

  useEffect(() => {
    if (!ready || !SITE_KEY || !container.current || !window.turnstile) return;

    const element = container.current;
    widgetId.current = window.turnstile.render(element, {
      sitekey: SITE_KEY,
      // Themed from the site's own resolved theme rather than left on "auto", which
      // follows the operating system and would disagree with an explicit choice here.
      theme,
      size: "flexible",
    });

    return () => {
      // Re-created rather than re-themed: the widget has no API for changing theme after
      // render, so a theme switch tears this one down and mounts another.
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
      element.innerHTML = "";
    };
  }, [ready, theme]);

  if (!SITE_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set; the challenge will not render.");
    }
    return null;
  }

  return (
    <div className="turnstile">
      <div ref={container} />
    </div>
  );
}
