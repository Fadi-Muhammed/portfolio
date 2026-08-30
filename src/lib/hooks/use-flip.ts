"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * FLIP for a filtered list: the survivors of a change move from where they were to where
 * they now are instead of jumping, and arrivals fade in.
 *
 * Written by hand rather than with a layout-animation library. Motion is already a
 * dependency and its layout animations would do this, but the lists it runs on here are
 * a handful of items each and B12's JavaScript budget is the reason to keep it to this.
 *
 * Written for Achievements in Part 10 and pulled up here in Part 12 for About's skill
 * filter, which needed the same behaviour on two more lists.
 *
 * Usage is two calls: `measure()` immediately before the state change that re-orders the
 * list, and nothing else — the layout effect plays the difference on the next commit.
 */

/**
 * The one easing and the one duration, read from the tokens rather than repeated here.
 * A hand-written animation carrying its own numbers is how a site ends up with two motion
 * systems, which is what DESIGN.md section 7 exists to prevent.
 */
function motionTokens(): { duration: number; easing: string } {
  const styles = getComputedStyle(document.documentElement);
  const ms = Number.parseFloat(styles.getPropertyValue("--dur"));
  return {
    duration: Number.isFinite(ms) ? ms : 280,
    easing: styles.getPropertyValue("--ease").trim() || "ease",
  };
}

type Options = {
  /**
   * The container holding the items. Omitted when the items are not under one — About's
   * skill filter moves cards in two different deck sections at once, so it searches the
   * document rather than a container that does not exist.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /** Selects the items. Each must carry a stable `data-slug`. */
  itemSelector: string;
  /** Re-run the animation whenever this changes — typically the filtered list. */
  key: unknown;
};

export function useFlip({ containerRef, itemSelector, key }: Options): () => void {
  const positions = useRef<Map<string, DOMRect>>(new Map());
  const reducedMotion = useReducedMotion();

  /** Record where everything is, before the change that moves it. */
  const measure = useCallback(() => {
    if (reducedMotion) return;
    const root = containerRef ? containerRef.current : document;
    if (!root) return;

    positions.current = new Map(
      Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).map((element) => [
        element.dataset.slug ?? "",
        element.getBoundingClientRect(),
      ]),
    );
  }, [containerRef, itemSelector, reducedMotion]);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const root = containerRef ? containerRef.current : document;
    if (!root) return;

    const first = positions.current;
    // Nothing was measured, so this is a first render rather than a change.
    if (first.size === 0) return;
    positions.current = new Map();

    const { duration, easing } = motionTokens();

    for (const element of root.querySelectorAll<HTMLElement>(itemSelector)) {
      const slug = element.dataset.slug ?? "";
      const before = first.get(slug);
      const after = element.getBoundingClientRect();

      if (!before) {
        element.animate({ opacity: [0, 1] }, { duration, easing, fill: "none" });
        continue;
      }

      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;

      element.animate(
        { transform: [`translate(${dx}px, ${dy}px)`, "translate(0, 0)"] },
        { duration, easing, fill: "none" },
      );
    }
  }, [key, containerRef, itemSelector, reducedMotion]);

  return measure;
}
