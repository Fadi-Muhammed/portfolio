import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown, parseBlocks } from "./markdown";

describe("splitting a body into blocks", () => {
  it("reads headings, paragraphs and lists", () => {
    const blocks = parseBlocks("## The problem\n\nIt was slow.\n\n- One\n- Two\n");
    expect(blocks).toEqual([
      { kind: "heading", level: 2, text: "The problem" },
      { kind: "paragraph", text: "It was slow." },
      { kind: "list", items: ["One", "Two"] },
    ]);
  });

  it("joins a wrapped paragraph back into one", () => {
    // Seed files wrap at 100 characters; a hard wrap is not a line break.
    expect(parseBlocks("One line\nand its continuation.")).toEqual([
      { kind: "paragraph", text: "One line and its continuation." },
    ]);
  });

  it("closes a list when a paragraph follows it", () => {
    const blocks = parseBlocks("- One\n- Two\n\nAfter.");
    expect(blocks).toEqual([
      { kind: "list", items: ["One", "Two"] },
      { kind: "paragraph", text: "After." },
    ]);
  });

  it("returns nothing for an empty body", () => {
    expect(parseBlocks("")).toEqual([]);
    expect(parseBlocks("   \n\n  ")).toEqual([]);
  });
});

describe("rendering a body", () => {
  it("renders nothing at all when there is no body", () => {
    const { container } = render(<Markdown>{null}</Markdown>);
    expect(container).toBeEmptyDOMElement();
  });

  it("gives headings real heading roles", () => {
    render(<Markdown>{"## What I built\n\n### How it works"}</Markdown>);
    expect(screen.getByRole("heading", { level: 2, name: "What I built" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "How it works" })).toBeInTheDocument();
  });

  it("renders bold, italic and code", () => {
    render(<Markdown>{"A **bold** and *soft* `value`."}</Markdown>);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("soft").tagName).toBe("EM");
    expect(screen.getByText("value").tagName).toBe("CODE");
  });

  it("opens external links in a new tab, safely", () => {
    render(<Markdown>{"See [the demo](https://example.test)."}</Markdown>);
    const link = screen.getByRole("link", { name: "the demo" });
    expect(link).toHaveAttribute("href", "https://example.test");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("keeps an in-page link in the same tab", () => {
    render(<Markdown>{"Back to [contact](#contact)."}</Markdown>);
    const link = screen.getByRole("link", { name: "contact" });
    expect(link).not.toHaveAttribute("target");
  });

  it("refuses to make a javascript: href into a link", () => {
    // The body is edited in a table editor. Nothing typed there may become a script.
    const { container } = render(<Markdown>{"[click me](javascript:alert(1))"}</Markdown>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    // The label survives as plain text, so the writer can see what they typed and fix it.
    expect(container.textContent).toContain("click me");
  });

  it("renders markup in the body as text, never as markup", () => {
    // The renderer emits React elements, so this is escaped by construction rather
    // than by a sanitiser that could be misconfigured.
    const { container } = render(<Markdown>{"<img src=x onerror=alert(1)>"}</Markdown>);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });

  it("shows unrecognised syntax rather than swallowing it", () => {
    render(<Markdown>{"A | table | row"}</Markdown>);
    expect(screen.getByText("A | table | row")).toBeInTheDocument();
  });
});
