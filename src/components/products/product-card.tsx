import Image from "next/image";
import Link from "next/link";
import { Tag } from "@/components/ui/tag";
import { mediaUrl } from "@/lib/content/media";
import type { Product } from "@/lib/content/queries";
import { LiveStatus } from "./live-status";

/**
 * One product, as it appears in the deck and on /products.
 *
 * The whole card is one link. Nested interactive elements inside a clickable card are
 * the usual way this component goes wrong — a link inside a link is invalid, and it
 * makes the card ambiguous to a keyboard. So the card has exactly one target, the case
 * study, and the live URL and repo live on the case-study page where there is room to
 * label them.
 *
 * `view-transition-name` is set from the slug so the cover can animate into the detail
 * page's hero image where the browser supports it (B5). Browsers that do not simply
 * cross-fade, which is the designed fallback rather than a degraded one.
 */
export function ProductCard({ product }: { product: Product }) {
  const cover = mediaUrl(product.cover_image_path);
  const stack = product.stack.slice(0, 3);

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card__link">
        <div
          className="product-card__media"
          style={{ viewTransitionName: `cover-${product.slug}` }}
        >
          {cover ? (
            <Image
              src={cover}
              alt=""
              width={1917}
              height={962}
              className="product-card__image"
              sizes="(min-width: 1024px) 30rem, 85vw"
            />
          ) : (
            // Not a grey rectangle pretending to be a photo. It says what is missing.
            <p className="product-card__no-image text-data text-muted">No screenshot yet</p>
          )}
        </div>

        <h3 className="product-card__title text-h3 text-ink">{product.title}</h3>
        {product.summary ? (
          <p className="product-card__summary text-small text-muted">{product.summary}</p>
        ) : null}
      </Link>

      <div className="product-card__foot">
        {stack.length > 0 ? (
          <ul className="product-card__stack">
            {stack.map((entry) => (
              <li key={entry}>
                <Tag>{entry}</Tag>
              </li>
            ))}
          </ul>
        ) : null}

        {product.status_check_url ? <LiveStatus slug={product.slug} /> : null}
      </div>
    </article>
  );
}
