"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getPreference,
  getServerPreference,
  getServerSystemTheme,
  getSystemTheme,
  subscribePreference,
  subscribeSystemTheme,
  writePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/components/theme/theme-store";

type ThemeContextValue = {
  /** What the visitor chose. "system" until they choose otherwise. */
  preference: ThemePreference;
  /** What is actually on screen right now. */
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Flips to the opposite of what is currently on screen. */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(subscribePreference, getPreference, getServerPreference);

  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    getServerSystemTheme,
  );

  const theme: ResolvedTheme = preference === "system" ? systemTheme : preference;

  // The only side effect: mirror the resolved theme onto <html>. ThemeScript already
  // set it before first paint, so this is keeping it current, not establishing it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setPreference = useCallback((next: ThemePreference) => writePreference(next), []);
  const toggle = useCallback(() => writePreference(theme === "dark" ? "light" : "dark"), [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
