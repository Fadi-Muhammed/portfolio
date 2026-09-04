"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * The Turnstile widget.
 *
 * Rendered explicitly rather than by Cloudflare's automatic scan of the page, because the
 * theme has to be passed at render time and the widget has to be re-created when the
 * visitor switches between light and dark — an automatic widget would keep whichever
 * theme it was born with.
 *
 * The script is loaded lazily. It is a third-party request on a page the visitor may
 * never submit anything from, and B12's budget is the reason it waits until this section
 * mounts rather than loading with the page.
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
    onTurnstileReady?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile() {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const { theme } = useTheme();

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
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setReady(true)}
      />
      <div ref={container} />
    </div>
  );
}
