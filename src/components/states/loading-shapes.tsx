import { Skeleton } from "@/components/ui/skeleton";

/**
 * What a route looks like before its content arrives (B10).
 *
 * Two shapes, because there are two shapes of page: an index, which is a grid of cards,
 * and an article, which is a column of prose beside a rail of facts. A single neutral
 * placeholder would have been less work and would misrepresent both.
 *
 * Every route on this site is either prerendered or revalidated, so these appear rarely —
 * on a slug that was added in Studio and has not been built yet, and on a revalidation
 * that misses. Rarely is not never, and B10's rule is that the visitor never gets a blank
 * screen or a spinner in the middle of nothing.
 *
 * The blocks reuse the page's own class names, so they occupy the boxes the content will
 * occupy and nothing moves when it arrives. One live region per page, on the container:
 * a dozen blocks each announcing themselves is not an improvement on silence.
 */

export function IndexSkeleton({ label, cards = 2 }: { label: string; cards?: number }) {
  return (
    <main className="detail" id="main" role="status" aria-label={label} aria-busy="true">
      <Skeleton className="h-4 w-32" label={null} />

      <div className="detail__head">
        <Skeleton className="h-10 w-48" label={null} />
        <Skeleton className="h-5 w-full max-w-sm" label={null} />
      </div>

      <ul className="product-grid">
        {Array.from({ length: cards }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-[16/10] w-full" label={null} />
            <Skeleton className="mt-4 h-5 w-40" label={null} />
            <Skeleton className="mt-2 h-4 w-full" label={null} />
          </li>
        ))}
      </ul>
    </main>
  );
}

export function ArticleSkeleton({ label }: { label: string }) {
  return (
    <main className="detail" id="main" role="status" aria-label={label} aria-busy="true">
      <Skeleton className="h-4 w-32" label={null} />

      <div className="detail__head">
        <Skeleton className="h-10 w-3/4 max-w-lg" label={null} />
        <Skeleton className="h-5 w-full max-w-md" label={null} />
      </div>

      <Skeleton className="aspect-[16/9] w-full" label={null} />

      <div className="detail__grid">
        <div className="detail__body">
          <Skeleton className="h-4 w-full" label={null} />
          <Skeleton className="mt-3 h-4 w-full" label={null} />
          <Skeleton className="mt-3 h-4 w-4/5" label={null} />
        </div>
        <div className="detail__aside">
          <Skeleton className="h-4 w-24" label={null} />
          <Skeleton className="mt-3 h-4 w-32" label={null} />
        </div>
      </div>
    </main>
  );
}
