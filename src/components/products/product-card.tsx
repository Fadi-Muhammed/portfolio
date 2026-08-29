import { WorkCard } from "@/components/work/work-card";
import type { Product } from "@/lib/content/queries";
import { LiveStatus } from "./live-status";

/**
 * A product, as it appears in the deck and on /products.
 *
 * The shell is `WorkCard`, shared with Engineering. What is specific to a product is the
 * live reading in the meta slot: a real measurement of whether the thing is up, which is
 * the one claim on this card that could go stale without anyone noticing.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <WorkCard
      href={`/products/${product.slug}`}
      title={product.title}
      summary={product.summary}
      coverPath={product.cover_image_path}
      transitionName={`cover-${product.slug}`}
      emptyMediaLabel="No screenshot yet"
      tags={product.stack.slice(0, 3)}
      meta={product.status_check_url ? <LiveStatus slug={product.slug} /> : null}
    />
  );
}
