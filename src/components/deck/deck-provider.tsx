"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { SECTIONS, sectionFromHash, sectionIndex, type SectionId } from "@/lib/deck/sections";
import { documentTitle, intentForKey, mostVisible, resolveIntent } from "@/lib/deck/state";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * The deck's single source of truth.
 *
 * Every way of moving around this site — the rail, the peek strip, the nav, the hero
 * topology in Part 7, the command palette in Part 6, the footer recap in Part 13 — calls
 * `hopTo`. One function means one behaviour: the same scroll, the same hash update, the
 * same title change, the same reduced-motion handling, everywhere. Anything that scrolls
 * on its own would be a second, quietly different implementation.
 *
 * Scrolling itself is left to CSS. The container has scroll-snap, so `scrollIntoView` is
 * a nudge rather than an animation the JavaScript owns; nothing here hijacks the wheel,
 * which B3 forbids outright.
 */

type DeckContextValue = {
  active: SectionId;
  activeIndex: number;
  hopTo: (id: SectionId) => void;
  /** True once the visitor is near the bottom of the current section (B3 keepalive). */
  nearEnd: boolean;
  deckRef: RefObject<HTMLDivElement | null>;
};

const DeckContext = createContext<DeckContextValue | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  const deckRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<SectionId>(SECTIONS[0].id);
  const [nearEnd, setNearEnd] = useState(false);
  const reducedMotion = useReducedMotion();

  const hopTo = useCallback(
    (id: SectionId) => {
      const target = document.getElementById(id);
      if (!target) return;

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });

      // Set immediately rather than waiting for the observer, so a click feels answered.
      // The observer corrects it if the scroll ends somewhere else.
      setActive(id);
    },
    [reducedMotion],
  );

  // Deep link: land directly on the section named in the URL, without animating there.
  // Runs once, before the observer has anything to say.
  useEffect(() => {
    const id = sectionFromHash(window.location.hash);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  // Which section is active, from how much of each is on screen.
  useEffect(() => {
    const root = deckRef.current;
    if (!root) return;

    const ratios = new Map<SectionId, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (SECTIONS.some((section) => section.id === id)) {
            ratios.set(id as SectionId, entry.intersectionRatio);
          }
        }
        const next = mostVisible(ratios);
        if (next) setActive(next);
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );

    for (const section of SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Hash follows the active section. replaceState rather than assigning location.hash,
  // which would scroll the container a second time and fight the snap.
  useEffect(() => {
    const url = `${window.location.pathname}${window.location.search}#${active}`;
    window.history.replaceState(null, "", url);
    document.title = documentTitle(active);
  }, [active]);

  // Keepalive: near the bottom of a section, the next teaser lifts and the packet pulses
  // once. Read from scroll position rather than a timer, so it tracks the visitor.
  useEffect(() => {
    const root = deckRef.current;
    if (!root) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const element = document.getElementById(active);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const scrolled = rootRect.top - rect.top;
        const progress = rect.height > 0 ? scrolled / rect.height : 0;
        setNearEnd(progress > 0.85);
      });
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [active]);

  // Keyboard paging. Ignored inside anything the visitor might be typing in or scrolling
  // through, because taking ArrowDown from a textarea is worse than not binding it.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true], [data-inner-scroll]")) {
        return;
      }

      const intent = intentForKey(event.key);
      if (!intent) return;

      const destination = resolveIntent(active, intent);
      if (!destination) return;

      event.preventDefault();
      hopTo(destination);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, hopTo]);

  const value = useMemo<DeckContextValue>(
    () => ({ active, activeIndex: sectionIndex(active), hopTo, nearEnd, deckRef }),
    [active, hopTo, nearEnd],
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck(): DeckContextValue {
  const context = useContext(DeckContext);
  if (!context) throw new Error("useDeck must be used inside <DeckProvider>");
  return context;
}
