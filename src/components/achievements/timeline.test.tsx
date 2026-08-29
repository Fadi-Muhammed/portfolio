import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Achievement } from "@/lib/content/queries";
import { Timeline } from "./timeline";

/**
 * The empty state, tested here because the UI cannot currently reach it.
 *
 * Every one of the five chips has an entry behind it today, so no click produces an empty
 * route — which is the point, but it also means Playwright has nothing to click to see
 * this state. It is real all the same: the moment an entry is unpublished, or a shared
 * link names a type that has since emptied, this is what the section says. Rendering the
 * component with a route that filters to nothing is the honest way to hold it to that.
 */

/**
 * jsdom has none of the three browser APIs this component reaches for, so each is
 * stubbed rather than avoided: with them stubbed the tests run the same branch a visitor
 * gets — motion allowed — and a crash in the FLIP or the print observer fails here rather
 * than in a browser. What they cannot check is the animation itself, which is Playwright's
 * job because only a real browser has one.
 */
function stubBrowserAPIs() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  Element.prototype.animate = vi.fn(() => ({ finished: Promise.resolve() })) as never;
}

function entry(overrides: Partial<Achievement> & { slug: string }): Achievement {
  return {
    id: overrides.slug,
    title: "An entry",
    type: "talk",
    event_name: "An event",
    role: null,
    result: null,
    date: "2026-01-01",
    city: null,
    country: null,
    summary: null,
    links: {},
    media: {},
    featured: false,
    published: true,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  stubBrowserAPIs();
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

describe("Timeline", () => {
  it("says what happened and how to undo it when a filter matches nothing", () => {
    render(<Timeline achievements={[entry({ slug: "a-talk", type: "talk" })]} />);

    // Nothing in the route is an award.
    fireEvent.click(screen.getByRole("button", { name: "Award" }));

    expect(screen.getByText(/No hops match/)).toBeInTheDocument();
    // The way out is a control, not a sentence describing one.
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("clearing the filter puts the route back", () => {
    render(<Timeline achievements={[entry({ slug: "a-talk", type: "talk" })]} />);

    fireEvent.click(screen.getByRole("button", { name: "Award" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.queryByText(/No hops match/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "An event" })).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("writes the filter to the URL so the view can be shared", () => {
    render(<Timeline achievements={[entry({ slug: "a-talk", type: "talk" })]} />);

    fireEvent.click(screen.getByRole("button", { name: "Talk" }));

    expect(window.location.search).toBe("?hop=talk");
    expect(screen.getByRole("button", { name: "Talk" })).toHaveAttribute("aria-pressed", "true");
  });

  it("offers no disclosure on a hop with nothing behind it", () => {
    render(<Timeline achievements={[entry({ slug: "bare" })]} />);

    // No summary, no photograph, no links: a control that opened an empty panel would be
    // worse than no control.
    expect(screen.queryByRole("button", { name: /Show detail/ })).not.toBeInTheDocument();
  });

  it("offers one on a hop that has something to show", () => {
    render(<Timeline achievements={[entry({ slug: "full", summary: "What happened." })]} />);

    const toggle = screen.getByRole("button", { name: /Show detail/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /Hide detail/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("What happened.")).toBeVisible();
  });
});
