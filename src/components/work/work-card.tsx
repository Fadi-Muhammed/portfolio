import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Tag } from "@/components/ui/tag";
import { mediaUrl } from "@/lib/content/media";

/**
 * The card shared by Products and Engineering.
 *
 * Both sections show the same object — a cover, a title, a one-line summary, a row of
 * tags and a line of something measured or applied — and differ only in what goes in the
 * last two slots. Two components that agreed on nine tenths of their markup would be the
 * parallel convention CLAUDE.md forbids, and the first divergence would be a card that
 * looked subtly wrong in one section.
 *
 * What varies is passed in: `tags` for the stack or the tools, and `meta` for the live
 * reading on a product or the concepts applied on an engineering project.
 *
 * The whole card is one link. A link inside a link is invalid and makes the card
 * ambiguous to a keyboard, so every card has exactly one destination — the detail page —
 * and the outward links live there, where there is room to label them.
 */

export type WorkCardProps = {
  href: string;
  title: string;
  summary: string | null;
  coverPath: string | null;
  /** Paired with the detail page's cover so it animates across (B5). */
  transitionName: string;
  /** Shown when there is no cover. Says what is missing rather than faking a photo. */
  emptyMediaLabel: string;
  tags: string[];
  meta?: ReactNode;
};

export function WorkCard({
  href,
  title,
  summary,
  coverPath,
  transitionName,
  emptyMediaLabel,
  tags,
  meta,
}: WorkCardProps) {
  const cover = mediaUrl(coverPath);

  return (
    <article className="work-card">
      <Link href={href} className="work-card__link">
        <div className="work-card__media" style={{ viewTransitionName: transitionName }}>
          {cover ? (
            <Image
              src={cover}
              alt=""
              width={1917}
              height={962}
              className="work-card__image"
              sizes="(min-width: 48rem) 20rem, 85vw"
            />
          ) : (
            <p className="work-card__no-image text-data text-muted">{emptyMediaLabel}</p>
          )}
        </div>

        <h3 className="work-card__title text-h3 text-ink">{title}</h3>
        {summary ? <p className="work-card__summary text-small text-muted">{summary}</p> : null}
      </Link>

      <div className="work-card__foot">
        {tags.length > 0 ? (
          <ul className="work-card__tags">
            {tags.map((entry) => (
              <li key={entry}>
                <Tag>{entry}</Tag>
              </li>
            ))}
          </ul>
        ) : null}
        {meta}
      </div>
    </article>
  );
}
