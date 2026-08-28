import { SECTIONS, sectionIndex, type SectionId } from "./sections";

/**
 * The deck's decisions, as pure functions.
 *
 * Everything here is deliberately free of the DOM so it can be tested directly. The
 * provider does the observing and the scrolling; this file decides what should happen,
 * which is the part worth being sure about.
 */

export type HopIntent = "next" | "previous" | "first" | "last";

/** The next section, or null at the end. The deck does not wrap — a deck has an end. */
export function nextSection(current: SectionId): SectionId | null {
  const index = sectionIndex(current);
  return index < SECTIONS.length - 1 ? SECTIONS[index + 1].id : null;
}

export function previousSection(current: SectionId): SectionId | null {
  const index = sectionIndex(current);
  return index > 0 ? SECTIONS[index - 1].id : null;
}

export function resolveIntent(current: SectionId, intent: HopIntent): SectionId | null {
  switch (intent) {
    case "next":
      return nextSection(current);
    case "previous":
      return previousSection(current);
    case "first":
      return current === SECTIONS[0].id ? null : SECTIONS[0].id;
    case "last": {
      const last = SECTIONS[SECTIONS.length - 1].id;
      return current === last ? null : last;
    }
  }
}

/**
 * Which key means which hop.
 *
 * Arrow keys are included per B3, but the caller must ignore them inside form fields and
 * inner scroll regions — taking ArrowDown away from a textarea would be worse than not
 * supporting it at all.
 */
export function intentForKey(key: string): HopIntent | null {
  switch (key) {
    case "PageDown":
      return "next";
    case "PageUp":
      return "previous";
    case "ArrowDown":
      return "next";
    case "ArrowUp":
      return "previous";
    case "Home":
      return "first";
    case "End":
      return "last";
    default:
      return null;
  }
}

/**
 * The active section from intersection ratios: whichever is most visible.
 *
 * Ties go to the earlier section, so a 50/50 split during a hop does not flicker between
 * two answers as ratios wobble.
 */
export function mostVisible(ratios: ReadonlyMap<SectionId, number>): SectionId | null {
  let best: SectionId | null = null;
  let bestRatio = 0;

  for (const section of SECTIONS) {
    const ratio = ratios.get(section.id) ?? 0;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = section.id;
    }
  }

  return best;
}

/**
 * Only the active section and its immediate neighbours mount their real content (B3).
 * The neighbours are included so a hop never lands on an empty box waiting to fill.
 */
export function shouldMount(id: SectionId, active: SectionId): boolean {
  return Math.abs(sectionIndex(id) - sectionIndex(active)) <= 1;
}

/** "Fadi Muhammed — Products". The hero is just the name; a suffix there says nothing. */
export function documentTitle(id: SectionId, siteName = "Fadi Muhammed"): string {
  const section = SECTIONS[sectionIndex(id)];
  if (!section || id === "hero") return siteName;
  return `${siteName} — ${section.name}`;
}

/** "hop 3 of 7 · engineering" */
export function railLabel(id: SectionId): string {
  const index = sectionIndex(id);
  const section = SECTIONS[index];
  if (!section) return "";
  return `hop ${index + 1} of ${SECTIONS.length} · ${section.name.toLowerCase()}`;
}
