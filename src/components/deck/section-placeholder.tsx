import type { DeckSection } from "@/lib/deck/sections";

/**
 * What a section shows until the part that builds it lands.
 *
 * Deliberately one honest line rather than a mockup. A greyed-out fake of the real
 * layout would make the deck look further along than it is, and the point of Part 5 is
 * to judge the deck's movement — spacing, snapping, rhythm — without content to hide
 * behind. If it feels good empty, it will feel good full.
 */
export function SectionPlaceholder({ section }: { section: DeckSection }) {
  return (
    <div className="flex h-full flex-col justify-start">
      <p className="text-data text-muted">Placeholder</p>
      <p className="measure text-body mt-2 text-ink">
        This section is built in {section.arrivesIn}.
      </p>
    </div>
  );
}
