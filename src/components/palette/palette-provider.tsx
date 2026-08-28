"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const open = useCallback(() => {
    setHasOpened(true);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setHasOpened(true);
        setIsOpen((value) => !value);
        return;
      }

      // "/" is the second shortcut B6 allows, guarded so it can never eat a keystroke
      // meant for a field.
      if (event.key === "/" && !meta && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        setHasOpened(true);
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo<PaletteContextValue>(() => ({ open, isOpen }), [open, isOpen]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {hasOpened ? <Palette open={isOpen} onOpenChange={setIsOpen} content={content} /> : null}
    </PaletteContext.Provider>
  );
}

export function usePalette(): PaletteContextValue {
  const context = useContext(PaletteContext);
  if (!context) throw new Error("usePalette must be used inside <PaletteProvider>");
  return context;
}
