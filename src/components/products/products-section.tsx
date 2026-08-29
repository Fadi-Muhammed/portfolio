import Link from "next/link";
import type { Product } from "@/lib/content/queries";
import { ProductCard } from "./product-card";

/**
 * The Products stop on the deck (B2 item 2).
 *
 * How many cards the deck shows before it defers to /products: four. A section is one
 * viewport, and four cards is what fits at 1440 without the grid turning into a
 * contact sheet. The link only appears when there are more than that, per B2 — a
 * "see everything" link next to everything is a link to where you already are.
 *
 * On a phone the cards are a horizontal filmstrip inside the section. It snaps on its
 * own axis, which is what stops it fighting the deck: the deck snaps vertically on the
 * page, the filmstrip snaps horizontally inside one child of it, and neither reads the
 * other's gestures.
 */

const CARDS_IN_DECK = 4;

export function ProductsSection({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="section-body">
        <p className="text-body text-ink measure">
          Nothing here yet. The products are being written up.
        </p>
        <p className="text-small text-muted measure mt-2">
          The engineering projects are further down the deck, and everything is reachable from
          search.
        </p>
      </div>
    );
  }

  const shown = products.slice(0, CARDS_IN_DECK);
  const hasMore = products.length > CARDS_IN_DECK;

  return (
    <div className="section-body">
      {/*
        The section header already says "Products — what I've built and shipped". An intro
        that opened by saying it again was the same job done twice, so this only does the
        part the header cannot: say what opening one gets you.
      */}
      <p className="section-intro text-body text-ink measure">
        Each one has a case study: what the problem was, what I built, and what it did or did not
        prove.
      </p>

      <ul className="work-strip" data-count={shown.length}>
        {shown.map((product) => (
          <li key={product.slug} className="work-strip__item">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <p className="section-more">
          <Link href="/products" className="text-small">
            All products <span aria-hidden="true">→</span>
          </Link>
        </p>
      ) : null}
    </div>
  );
}
