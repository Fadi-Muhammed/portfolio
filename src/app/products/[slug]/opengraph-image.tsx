import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";
import { getProduct } from "@/lib/content/queries";

export const alt = "A product case study by Fadi Muhammed.";
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);

  return renderCard({
    eyebrow: "Product",
    title: product?.title ?? "Products",
    summary: product?.summary,
    at: "products",
  });
}
