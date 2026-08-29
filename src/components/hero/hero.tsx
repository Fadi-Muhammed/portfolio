import type { SiteSettings } from "@/lib/content/queries";
import { HeroActions } from "./hero-actions";
import { Topology } from "./topology";

/**
 * The hero (B4, docs/DESIGN.md 11.1 and 11.2).
 *
 * Reading order is the whole design: the topology catches the eye by moving, the
 * tagline is the big second read, the buttons are the action, the quote is the quiet
 * last thing. The topology is quieter than the tagline by construction — hairline
 * strokes in `muted`, nothing in `ink`, under 1 % ink coverage — so it draws attention
 * by movement, which the tagline does not compete for, and loses on contrast, which
 * the tagline wins outright.
 *
 * Every string comes from `site_settings`. When a field is missing the element is not
 * rendered at all: an empty eyebrow is better than a visible gap where copy should be,
 * and inventing a fallback would put words on the site that Fadi never wrote.
 *
 * The DOM order is the mobile order. At 1440 the topology is lifted into the right-hand
 * field with grid placement rather than by reordering the markup, so the reading order
 * a screen reader and a keyboard get is the reading order the design intends.
 */
export function Hero({ settings }: { settings: SiteSettings | null }) {
  return (
    <div className="hero">
      {settings?.eyebrow ? (
        <p className="hero__eyebrow text-data text-muted">{settings.eyebrow}</p>
      ) : null}

      <h1 className="hero__tagline text-display text-ink text-balance">
        {settings?.tagline ?? "Fadi Muhammed"}
      </h1>

      <HeroActions settings={settings} />

      <div className="hero__signature">
        <Topology />
      </div>

      {settings?.quote ? (
        <figure className="hero__quote">
          <blockquote className="text-small text-ink">{settings.quote}</blockquote>
          {settings.quote_author ? (
            <figcaption className="text-data text-muted mt-2">{settings.quote_author}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {settings?.availability ? (
        <p className="hero__availability text-data text-muted">{settings.availability}</p>
      ) : null}
    </div>
  );
}
