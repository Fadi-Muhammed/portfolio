"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/components/ui/link";
import { galleryImages, mediaUrl } from "@/lib/content/media";
import {
  formatPlace,
  formatWhen,
  hopLinks,
  hopNumber,
  showsTitle,
  TYPE_LABELS,
  type Hop as HopModel,
} from "@/lib/achievements/timeline";

/**
 * One stop on the route.
 *
 * The structure is a traceroute line read as a block: the number and the node dot on the
 * left, what happened in the middle, and when and where it happened in the right-hand
 * column where a traceroute prints its times. The hop number is allowed to be a
 * structural device here because the deck is a real sequence and this is a real route —
 * B13's own exception, not decoration borrowed from it.
 *
 * There is no `*` in the result column for an entry with no result. It was drafted, and
 * it is the traceroute's own token for "no reply", but three of the five entries have no
 * result and one of them is a talk — a talk does not place, so printing "no reply"
 * against it would state a failure that never applied.
 */

/** The single photograph a hop reveals: its cover, or the first of its gallery. */
function coverOf(media: unknown): { path: string; alt: string } | null {
  if (typeof media !== "object" || media === null) return null;
  const record = media as Record<string, unknown>;
  const gallery = galleryImages(record.gallery);

  if (typeof record.cover === "string" && record.cover.length > 0) {
    const described = gallery.find((image) => image.path === record.cover);
    return { path: record.cover, alt: described?.alt ?? "" };
  }
  return gallery[0] ?? null;
}

export function Hop({ hop }: { hop: HopModel }) {
  const { entry, number } = hop;
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const itemRef = useRef<HTMLLIElement | null>(null);

  /*
   * Bring what was just opened into view.
   *
   * The route scrolls inside the section, and that region is short — opening the detail
   * on any hop but the first put the photograph and the links entirely below the fold, so
   * the control appeared to do nothing. Only the list's own scrollTop is touched:
   * `scrollIntoView` would scroll every scrollable ancestor including the deck, which is
   * exactly the fight with scroll-snap that B3 forbids.
   */
  useEffect(() => {
    if (!open) return;
    const item = itemRef.current;
    const list = item?.closest<HTMLElement>(".hop-list");
    if (!item || !list) return;

    const overflow = item.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom;
    if (overflow > 0) list.scrollTop += overflow;
  }, [open]);

  const when = formatWhen(entry.date);
  const place = formatPlace(entry.city, entry.country);
  const links = hopLinks(entry.links);
  const cover = coverOf(entry.media);
  const image = mediaUrl(cover?.path);

  // Only offer a disclosure when there is something behind it. A control that opens an
  // empty panel is worse than no control.
  const hasDetail = Boolean(entry.summary || image || links.length > 0);

  return (
    <li ref={itemRef} className="hop" data-slug={entry.slug}>
      <div className="hop__mark" aria-hidden="true">
        <span className="hop__node" />
      </div>

      <p className="hop__number hop__print text-data text-muted" data-print-step="0">
        <span className="sr-only">Hop </span>
        {hopNumber(number)}
      </p>

      <div className="hop__main">
        <h3 className="hop__event hop__print text-h3 text-ink" data-print-step="2">
          {entry.event_name ?? entry.title}
        </h3>

        {entry.event_name && showsTitle(entry.title, entry.event_name) ? (
          <p className="hop__title hop__print text-body text-ink" data-print-step="2">
            {entry.title}
          </p>
        ) : null}

        <div className="hop__actions">
          {entry.role ? (
            <p className="hop__role hop__print text-small text-muted" data-print-step="3">
              {entry.role}
            </p>
          ) : null}

          {hasDetail ? (
            <button
              type="button"
              className="hop__toggle text-data"
              aria-expanded={open}
              aria-controls={detailId}
              onClick={() => setOpen((value) => !value)}
            >
              <span
                className="hop__toggle-glyph"
                aria-hidden="true"
                data-open={open || undefined}
              />
              {open ? "Hide detail" : "Show detail"}
              <span className="sr-only"> for {entry.event_name ?? entry.title}</span>
            </button>
          ) : null}
        </div>

        {hasDetail ? (
          <div id={detailId} className="hop__detail" hidden={!open}>
            {entry.summary ? (
              <p className="hop__summary text-body text-ink measure">{entry.summary}</p>
            ) : null}

            {image ? (
              <figure className="hop__figure">
                <Image
                  src={image}
                  alt={cover?.alt ?? ""}
                  width={1600}
                  height={1200}
                  className="hop__image"
                  sizes="(min-width: 48rem) 22rem, 90vw"
                />
              </figure>
            ) : null}

            {links.length > 0 ? (
              <ul className="hop__links">
                {links.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} external={link.external} className="text-small">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="hop__meta hop__print" data-print-step="1">
        {when ? <p className="text-data text-muted">{when}</p> : null}
        {place ? <p className="text-data text-muted">{place}</p> : null}
        <p className="text-data text-muted">{TYPE_LABELS[entry.type]}</p>
        {entry.result ? <p className="hop__result text-data text-ink">{entry.result}</p> : null}
      </div>
    </li>
  );
}
