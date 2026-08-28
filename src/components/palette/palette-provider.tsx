"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PaletteContent } from "@/lib/palette/items";

/**
 * Owns whether the palette is open, and the two ways of opening it.
 *
 * The palette itself is loaded only once someone asks for it. It pulls in cmdk and a
 * dialog, which is real weight for something most visitors never open, and B12's budget
 * is tight. `hasOpened` latches so the module is fetched once and then stays.
 */

const Palette = dynamic(() => import("./palette").then((module) => module.Palette), {
  ssr: false,
});

type PaletteContextValue = {
  open: () => void;
  isOpen: boolean;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

/** True when the visitor is typing, so a bare "/" does not steal the keystroke. */
function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return Boolean(element?.closest("input, textarea, select, [contenteditable=true]"));
}

export function PaletteProvider({
  content,
  children,
}: {
  content: PaletteContent;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  /**
   * Whatever had focus when the palette opened, so it can be given back.
   *
   * The dialog library is supposed to restore focus itself, and measurably did not —
   * focus landed on <body>, which strands a keyboard visitor at the top of the document.
   * Remembering the element ourselves makes the guarantee ours rather than inherited.
   */
  const opener = useRef<HTMLElement | null>(null);

  const remember = useCallback(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    // Ignore focus that is already inside the palette, so re-triggering the shortcut
    // while it is open cannot overwrite the opener with the palette's own input.
    if (active.closest("[cmdk-root]")) return;
    opener.current = active;
  }, []);

  const open = useCallback(() => {
    remember();
    setHasOpened(true);
    setIsOpen(true);
  }, [remember]);

  const setOpen = useCallback((next: boolean) => {
    setIsOpen(next);
    if (!next) {
      // After the dialog has finished unwinding, not during it.
      window.setTimeout(() => opener.current?.focus(), 0);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        remember();
        setHasOpened(true);
        setIsOpen((value) => !value);
        return;
      }

      // "/" is the second shortcut B6 allows, guarded so it can never eat a keystroke
      // meant for a field.
      if (event.key === "/" && !meta && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        remember();
        setHasOpened(true);
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [remember]);

  const value = useMemo<PaletteContextValue>(() => ({ open, isOpen }), [open, isOpen]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {hasOpened ? <Palette open={isOpen} onOpenChange={setOpen} content={content} /> : null}
    </PaletteContext.Provider>
  );
}

export function usePalette(): PaletteContextValue {
  const context = useContext(PaletteContext);
  if (!context) throw new Error("usePalette must be used inside <PaletteProvider>");
  return context;
}
