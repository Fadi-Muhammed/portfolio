import { describe, expect, it } from "vitest";
import { SECTIONS } from "@/lib/deck/sections";
import { buildItems, EMPTY_CONTENT, groupItems, scoreItem, type PaletteContent } from "./items";

/**
 * The palette's list is data, so these test what it offers and what selecting it does —
 * the decisions — rather than how it looks.
 */

const content: PaletteContent = {
  products: [{ slug: "rubric", title: "Rubric", summary: "One shared pool of applicants." }],
  engineering: [
    {
      slug: "intelligent-street-light-system",
      title: "Intelligent street light system",
      type: "lab",
      summary: "An ESP32 reads ambient light.",
    },
  ],
  achievements: [
    {
      slug: "web-summit-qatar-2026-talk",
      title: "Students turning challenges into solutions",
      type: "talk",
      event_name: "Web Summit Qatar 2026",
    },
  ],
  email: "work.fmuhammed@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/fadi-muhammed-524b75310",
    github: "https://github.com/Fadi-Muhammed",
  },
  cvUrl: "https://example.supabase.co/storage/v1/object/public/documents/cv.pdf",
};

const byId = (id: string) => buildItems(content).find((item) => item.id === id);

describe("sections", () => {
  it("lists every section, in deck order", () => {
    const sections = buildItems(content).filter((item) => item.group === "Sections");
    expect(sections.map((item) => item.label)).toEqual(SECTIONS.map((section) => section.name));
  });

  it("hops rather than navigating", () => {
    expect(byId("section:contact")?.action).toEqual({ kind: "hop", section: "contact" });
  });

  it("keeps the teaser searchable without showing it", () => {
    const engineering = byId("section:engineering");
    expect(engineering?.hint).toBeUndefined();
    expect(engineering?.keywords).toContain("lab");
  });
});

describe("content items", () => {
  it("hops to the section, because detail pages do not exist until Parts 8 and 9", () => {
    expect(byId("product:rubric")?.action).toEqual({ kind: "hop", section: "products" });
    expect(byId("engineering:intelligent-street-light-system")?.action).toEqual({
      kind: "hop",
      section: "engineering",
    });
  });

  it("makes a product findable by words from its summary, not just its title", () => {
    expect(byId("product:rubric")?.keywords).toContain("applicants");
  });

  it("shows the event on an achievement, since the title alone can be ambiguous", () => {
    expect(byId("achievement:web-summit-qatar-2026-talk")?.hint).toBe("Web Summit Qatar 2026");
  });
});

describe("links", () => {
  it("marks outbound items as external rather than describing them in words", () => {
    expect(byId("link:linkedin")?.external).toBe(true);
    expect(byId("link:linkedin")?.hint).toBeUndefined();
  });

  it("offers the CV as a download when there is one", () => {
    expect(byId("link:cv")?.action).toEqual({ kind: "download", href: content.cvUrl });
  });

  it("omits a link entirely when the value is missing, rather than listing a dead one", () => {
    const items = buildItems({ ...content, socials: {}, cvUrl: null, email: null });
    for (const id of ["link:linkedin", "link:github", "link:email", "link:cv"]) {
      expect(items.find((item) => item.id === id)).toBeUndefined();
    }
  });

  it("has no X entry, because A19 records no X account", () => {
    expect(buildItems(content).some((item) => item.label === "X")).toBe(false);
  });
});

describe("actions", () => {
  it("always offers theme and ping, even with no content at all", () => {
    const ids = buildItems(EMPTY_CONTENT).map((item) => item.id);
    expect(ids).toContain("action:toggle-theme");
    expect(ids).toContain("action:ping");
  });

  it("drops copy email when there is no address to copy", () => {
    const ids = buildItems({ ...content, email: null }).map((item) => item.id);
    expect(ids).not.toContain("action:copy-email");
  });
});

describe("with no content", () => {
  it("still reaches every section, so the palette is never useless", () => {
    const sections = buildItems(EMPTY_CONTENT).filter((item) => item.group === "Sections");
    expect(sections).toHaveLength(SECTIONS.length);
  });
});

describe("grouping", () => {
  it("orders groups as B6 lists them", () => {
    expect(groupItems(buildItems(content)).map(([group]) => group)).toEqual([
      "Sections",
      "Products",
      "Engineering",
      "Achievements & talks",
      "Links",
      "Actions",
    ]);
  });

  it("omits empty groups rather than rendering an empty heading", () => {
    const groups = groupItems(buildItems(EMPTY_CONTENT)).map(([group]) => group);
    expect(groups).toEqual(["Sections", "Actions"]);
  });

  it("gives every item a unique id", () => {
    const ids = buildItems(content).map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("scoring", () => {
  it("puts an exact label match above everything", () => {
    // The bug this exists to prevent: "ping" ranked below "Achievements", because the
    // letters p, i, n, g all appear in "competitions and programmes".
    const ping = scoreItem("ping", "ping", ["latency", "network"]);
    const achievements = scoreItem("Achievements", "ping", [
      "stages",
      "competitions",
      "and",
      "programmes",
    ]);
    expect(ping).toBeGreaterThan(achievements);
    expect(ping).toBe(1);
  });

  it("ranks label matches above keyword matches", () => {
    expect(scoreItem("Contact", "cont", [])).toBeGreaterThan(
      scoreItem("About", "cont", ["contact"]),
    );
  });

  it("ranks a prefix above a match in the middle", () => {
    expect(scoreItem("Engineering", "eng", [])).toBeGreaterThan(
      scoreItem("Reverse engineering", "eng", []),
    );
  });

  it("still finds a long title from an initialism", () => {
    expect(scoreItem("Intelligent street light system", "isls", [])).toBeGreaterThan(0);
  });

  it("returns nothing for a query that does not match at all", () => {
    expect(scoreItem("Products", "zzzz", ["work"])).toBe(0);
  });

  it("keeps everything when nothing has been typed", () => {
    expect(scoreItem("Anything", "", [])).toBe(1);
    expect(scoreItem("Anything", "   ", [])).toBe(1);
  });

  it("ignores case and surrounding space", () => {
    expect(scoreItem("Contact", "  CONTACT ", [])).toBe(1);
  });

  it("matches a keyword the label does not contain", () => {
    // "lab" is in the Engineering teaser, not its name.
    expect(scoreItem("Engineering", "lab", ["lab", "hardware"])).toBeGreaterThan(0);
  });
});
