/**
 * The theme lives outside React: in localStorage, in the OS setting, and on the
 * <html> element that an inline script already wrote before hydration. Modelling it
 * as an external store rather than as component state is what keeps React reading
 * the truth instead of a copy that has to be kept in sync with an effect.
 */

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Same-tab subscribers. The storage event only fires in *other* tabs. */
const listeners = new Set<() => void>();

export function subscribePreference(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

/** The server cannot know the visitor's choice, so it renders the neutral one. */
export function getServerPreference(): ThemePreference {
  return "system";
}

export function writePreference(preference: ThemePreference): void {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage unavailable (private mode, blocked): the choice still applies to this
    // page view via the notification below.
  }
  for (const listener of listeners) listener();
}

export function subscribeSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** Light is the theme designed first, so it is the honest server default. */
export function getServerSystemTheme(): ResolvedTheme {
  return "light";
}
