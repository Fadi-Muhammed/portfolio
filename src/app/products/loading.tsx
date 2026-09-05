import { IndexSkeleton } from "@/components/states/loading-shapes";

/** Covers /products. The case study below it has its own, article-shaped. */
export default function Loading() {
  return <IndexSkeleton label="Loading products" cards={2} />;
}
