import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./theme-provider";

/**
 * jsdom has no matchMedia, so the system preference is faked. The listener set is kept
 * so a test can simulate the OS flipping while the page is open.
 */
function mockMatchMedia(prefersDark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") ? prefersDark : false,
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );

  return {
    flipTo(dark: boolean) {
      mockMatchMedia(dark);
      act(() => {
        for (const listener of listeners) {
          listener({ matches: dark } as MediaQueryListEvent);
        }
      });
    },
  };
}

function Probe() {
  const { theme, preference, toggle, setPreference } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="preference">{preference}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setPreference("system")}>use system</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ThemeProvider", () => {
  it("follows the system preference when the visitor has not chosen", () => {
    mockMatchMedia(true);
    renderWithProvider();

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("resolves to light when the system prefers light", () => {
    mockMatchMedia(false);
    renderWithProvider();

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("tracks the system while the preference is still system", () => {
    const media = mockMatchMedia(false);
    renderWithProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    media.flipTo(true);
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("persists an explicit choice and stops following the system", () => {
    mockMatchMedia(false);
    renderWithProvider();

    act(() => screen.getByRole("button", { name: "toggle" }).click());

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("reads a stored choice on first render", () => {
    localStorage.setItem("theme", "dark");
    mockMatchMedia(false);
    renderWithProvider();

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
  });

  it("clears the stored choice when going back to system", () => {
    localStorage.setItem("theme", "dark");
    mockMatchMedia(false);
    renderWithProvider();

    act(() => screen.getByRole("button", { name: "use system" }).click());

    expect(localStorage.getItem("theme")).toBeNull();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("mirrors the resolved theme onto the html element", () => {
    mockMatchMedia(true);
    renderWithProvider();

    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("ignores a corrupt stored value rather than trusting it", () => {
    localStorage.setItem("theme", "chartreuse");
    mockMatchMedia(false);
    renderWithProvider();

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });
});

describe("useTheme", () => {
  it("fails loudly outside the provider instead of returning a default", () => {
    // The console error React logs for the thrown render is noise here.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/useTheme must be used inside/);
    spy.mockRestore();
  });
});
