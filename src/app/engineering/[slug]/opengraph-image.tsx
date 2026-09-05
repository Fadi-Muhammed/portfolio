import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";
import { getEngineeringProject } from "@/lib/content/queries";

export const alt = "An engineering project by Fadi Muhammed.";
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getEngineeringProject(slug).catch(() => null);

  return renderCard({
    eyebrow: project?.type ? `Engineering · ${project.type}` : "Engineering",
    title: project?.title ?? "Engineering",
    summary: project?.summary,
    at: "engineering",
  });
}
