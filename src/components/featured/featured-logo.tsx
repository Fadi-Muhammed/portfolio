"use client";

import { useState, type CSSProperties } from "react";
import type { FeaturedIn } from "@/lib/content/queries";
import { storageUrl } from "@/lib/content/media";

/**
 * One logo.
 *
 * Two layers over one file. The bottom is the logo in its own colours; the top is a flat
 * fill in a token colour, masked by the same image, which is what makes every mark read
 * at the same weight regardless of whether its own artwork is near-black (Al Fikra) or
 * nearly white (Qatar Television). Both layers name the same URL, so the browser fetches
 * it once.
 *
 * A mask rather than `filter: grayscale()`: greyscale preserves luminance, so a pale mark
 * stays pale and a black one stays black — the two failures this set has at both ends.
 *
 * A logo with no coverage URL is not a link. Nine of nine are in that state today, and
 * the day the URLs arrive `href` is the only thing that changes here.
 */

type Props = { entry: FeaturedIn };

export function FeaturedLogo({ entry }: Props) {
  const [failed, setFailed] = useState(false);
  const source = storageUrl("logos", entry.logo_path);

  // The designed fallback (Part 11 step 3): the name in the utility face, never a broken
  // image icon. Covers both an unset path and a file that will not load.
  const content =
    source && !failed ? (
      <span
        className="featured__mark"
        // The mask needs the URL in CSS. React types style as CSSProperties, which has no
        // room for a custom property, so this is the one place a cast is warranted.
        style={{ "--logo": `url("${source}")` } as CSSProperties}
      >
        {/*
          next/image is wrong here, which is why the rule is turned off rather than
          worked around. The mask on the layer above has to name the same URL as this
          image; next/image rewrites src to an optimised endpoint, so the two would point
          at different resources and the logo would be fetched twice. A plain img keeps it
          to one request, and keeps the onError that the designed fallback depends on.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source}
          alt=""
          width={600}
          height={421}
          loading="lazy"
          decoding="async"
          className="featured__colour"
          onError={() => setFailed(true)}
        />
        <span className="featured__mono" aria-hidden="true" />
      </span>
    ) : (
      <span className="featured__fallback text-data">{entry.name}</span>
    );

  return (
    <li className="featured__item" data-slug={entry.slug}>
      {entry.url ? (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="featured__link"
          aria-label={`${entry.name} (opens in a new tab)`}
        >
          {content}
        </a>
      ) : (
        <span className="featured__link" role="img" aria-label={entry.name}>
          {content}
        </span>
      )}
    </li>
  );
}
