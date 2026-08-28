import { SECTIONS, type SectionId } from "@/lib/deck/sections";

/**
 * What the command palette can do, as data.
 *
 * Building the item list is kept separate from rendering it so the decisions that matter
 * — what is listed, what it is called, what selecting it does — can be tested directly
 * rather than through a UI.
 *
 * Every navigation action resolves to a section hop. Detail pages at /products/[slug] and
 * /engineering/[slug] do not exist until Parts 8 and 9, and a palette that sends people
 * to a 404 is worse than one that takes them to the right section. Those parts change the
 * `action` here and nothing else.
 */

export type PaletteGroup =
  "Sections" | "Products" | "Engineering" | "Achievements & talks" | "Links" | "Actions";

export type PaletteAction =
  | { kind: "hop"; section: SectionId }
  | { kind: "external"; href: string }
  | { kind: "download"; href: string }
  | { kind: "copy-email"; email: string }
  | { kind: "toggle-theme" }
  | { kind: "ping" };

export type PaletteItem = {
  /** Stable and unique; used as the cmdk value and the React key. */
  id: string;
  group: PaletteGroup;
  label: string;
  /** Extra words the item should match on, beyond its label. */
  keywords: string[];
  /** Quiet text on the right: a type, a destination, a shortcut. */
  hint?: string;
  /** Marks the item as leaving the site. Shown as a glyph, announced as words. */
  external?: boolean;
  action: PaletteAction;
};

/** The shape the palette needs, kept minimal so the server sends as little as possible. */
export type PaletteContent = {
  products: Array<{ slug: string; title: string; summary: string | null }>;
  engineering: Array<{ slug: string; title: string; type: string; summary: string | null }>;
  achievements: Array<{ slug: string; title: string; type: string; event_name: string | null }>;
  email: string | null;
  socials: Record<string, string>;
  cvUrl: string | null;
};

export const EMPTY_CONTENT: PaletteContent = {
  products: [],
  engineering: [],
  achievements: [],
  email: null,
  socials: {},
  cvUrl: null,
};

/** Sentence case for a label that arrives as a lowercase enum. */
function sentence(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildItems(content: PaletteContent): PaletteItem[] {
  const items: PaletteItem[] = [];

  for (const section of SECTIONS) {
    items.push({
      id: `section:${section.id}`,
      group: "Sections",
      label: section.name,
      // The teaser is searchable so "lab" finds Engineering without it being in the name.
      // The teaser stays searchable but is not shown: as a hint it is a full sentence,
      // uppercased and truncated mid-word, competing with the name it should support.
      keywords: [section.id, ...section.teaser.toLowerCase().split(/\W+/).filter(Boolean)],
      action: { kind: "hop", section: section.id },
    });
  }

  for (const product of content.products) {
    items.push({
      id: `product:${product.slug}`,
      group: "Products",
      label: product.title,
      keywords: [
        product.slug,
        ...(product.summary ?? "").toLowerCase().split(/\W+/).filter(Boolean),
      ],
      action: { kind: "hop", section: "products" },
    });
  }

  for (const project of content.engineering) {
    items.push({
      id: `engineering:${project.slug}`,
      group: "Engineering",
      label: project.title,
      keywords: [project.slug, project.type],
      hint: sentence(project.type),
      action: { kind: "hop", section: "engineering" },
    });
  }

  for (const achievement of content.achievements) {
    items.push({
      id: `achievement:${achievement.slug}`,
      group: "Achievements & talks",
      label: achievement.title,
      keywords: [achievement.slug, achievement.type, achievement.event_name ?? ""].filter(Boolean),
      hint: achievement.event_name ?? sentence(achievement.type),
      action: { kind: "hop", section: "achievements" },
    });
  }

  // Links: only what actually exists. A19 records no X account, so B6's X entry is
  // deliberately absent rather than present and dead.
  if (content.socials.linkedin) {
    items.push({
      id: "link:linkedin",
      group: "Links",
      label: "LinkedIn",
      keywords: ["social", "profile", "connect"],
      external: true,
      action: { kind: "external", href: content.socials.linkedin },
    });
  }

  if (content.socials.github) {
    items.push({
      id: "link:github",
      group: "Links",
      label: "GitHub",
      keywords: ["code", "source", "repository"],
      external: true,
      action: { kind: "external", href: content.socials.github },
    });
  }

  if (content.email) {
    items.push({
      id: "link:email",
      group: "Links",
      label: "Email",
      keywords: ["mail", "contact", "write"],
      hint: content.email,
      action: { kind: "external", href: `mailto:${content.email}` },
    });
  }

  if (content.cvUrl) {
    items.push({
      id: "link:cv",
      group: "Links",
      label: "CV",
      keywords: ["resume", "download", "pdf"],
      hint: "PDF",
      action: { kind: "download", href: content.cvUrl },
    });
  }

  if (content.email) {
    items.push({
      id: "action:copy-email",
      group: "Actions",
      label: "Copy email",
      keywords: ["clipboard", "address"],
      hint: content.email,
      action: { kind: "copy-email", email: content.email },
    });
  }

  items.push({
    id: "action:toggle-theme",
    group: "Actions",
    label: "Toggle theme",
    keywords: ["dark", "light", "appearance", "colour", "color"],
    action: { kind: "toggle-theme" },
  });

  items.push({
    id: "action:ping",
    group: "Actions",
    label: "ping",
    keywords: ["latency", "network", "icmp", "status", "health"],
    hint: "Measure the round trip",
    action: { kind: "ping" },
  });

  return items;
}

/** Items grouped in the order B6 lists, skipping groups with nothing in them. */
export function groupItems(items: PaletteItem[]): Array<[PaletteGroup, PaletteItem[]]> {
  const order: PaletteGroup[] = [
    "Sections",
    "Products",
    "Engineering",
    "Achievements & talks",
    "Links",
    "Actions",
  ];

  return order
    .map(
      (group) =>
        [group, items.filter((item) => item.group === group)] as [PaletteGroup, PaletteItem[]],
    )
    .filter(([, groupItems]) => groupItems.length > 0);
}
