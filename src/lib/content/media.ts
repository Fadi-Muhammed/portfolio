/**
 * Public URLs for things in Supabase Storage.
 *
 * Storage paths in the database are relative to their bucket — `rubric/cover.jpg`, not a
 * full URL — so the project can move without a rewrite of every row. This is the one
 * place that turns them back into something a browser can fetch.
 *
 * Returns null rather than a broken URL when the path is missing or Supabase is not
 * configured, so a caller renders no image rather than an image that will 404.
 */

export type Bucket = "media" | "logos" | "documents";

export function storageUrl(bucket: Bucket, path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export const mediaUrl = (path: string | null | undefined) => storageUrl("media", path);

/**
 * A gallery entry as the seed writes it. `gallery` is `jsonb`, so nothing about its
 * shape is guaranteed by the database — this narrows it once, here, and everything
 * downstream gets a typed value or nothing.
 */
export type GalleryImage = { path: string; alt: string };

export function galleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is GalleryImage =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as GalleryImage).path === "string" &&
      typeof (entry as GalleryImage).alt === "string",
  );
}

/**
 * The projected-or-measured figures on a case study.
 *
 * `basis` is the reason this is parsed rather than rendered loosely: Rubric's numbers are
 * projections from a 48-hour build, and the qualifier has to travel with the numbers
 * instead of living in prose a card layout could drop. A metrics block with no basis is
 * not rendered at all — better nothing than a figure whose standing is unstated.
 */
export type MetricItem = { value: string; label: string };
export type Metrics = { basis: "projected" | "measured"; note: string | null; items: MetricItem[] };

export function parseMetrics(value: unknown): Metrics | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const basis = record.basis;
  if (basis !== "projected" && basis !== "measured") return null;

  const items = Array.isArray(record.items)
    ? record.items.filter(
        (item): item is MetricItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as MetricItem).value === "string" &&
          typeof (item as MetricItem).label === "string",
      )
    : [];
  if (items.length === 0) return null;

  return { basis, note: typeof record.note === "string" ? record.note : null, items };
}
