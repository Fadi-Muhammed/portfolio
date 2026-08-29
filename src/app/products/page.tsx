import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { getProducts } from "@/lib/content/queries";

/**
 * Every product, on one page.
 *
 * The deck shows the first few; this is where the rest live, and it is also the route
 * someone types or lands on from a search result. It exists even while everything fits
 * in the deck, because a URL that people can reasonably guess should not 404.
 */

export const metadata: Metadata = {
  title: "Products — Fadi Muhammed",
  description: "Products I have built and shipped, each with a case study.",
};

export default async function ProductsIndex() {
  const products = await getProducts();

  return (
    <main className="detail" id="main">
      <p className="detail__back text-data">
        <Link href="/#products">
          <span aria-hidden="true">←</span> Back to the deck
        </Link>
      </p>

      <header className="detail__head">
        <h1 className="text-h1 text-ink">Products</h1>
        <p className="detail__summary text-body text-muted measure">
          Things I have built and shipped. Each one has a case study.
        </p>
      </header>

      {products.length === 0 ? (
        <p className="text-body text-ink measure">
          Nothing here yet. The products are being written up.
        </p>
      ) : (
        <ul className="product-grid">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
