import { WorkCard } from "@/components/work/work-card";
import type { EngineeringProject } from "@/lib/content/queries";

/**
 * An engineering project, as it appears in the deck and on /engineering.
 *
 * The same shell as a product card. What is specific here is the concepts line in the
 * meta slot: B2 asks for it by name, and it is the thing that makes this section legible
 * to someone scanning for whether the work is real — "OFDM, link budget" says more about
 * a project than any summary of it.
 *
 * Tools take the tag row, concepts take the meta line. The two are genuinely different:
 * tools are what was in your hand, concepts are what you had to understand.
 */
export function EngineeringCard({ project }: { project: EngineeringProject }) {
  const concepts = project.concepts.slice(0, 3);

  return (
    <WorkCard
      href={`/engineering/${project.slug}`}
      title={project.title}
      summary={project.summary}
      coverPath={project.cover_image_path}
      transitionName={`cover-${project.slug}`}
      emptyMediaLabel="No photo yet"
      tags={project.tools.slice(0, 3)}
      meta={
        concepts.length > 0 ? (
          <p className="work-card__concepts text-data text-muted">
            {concepts.join(" · ")}
            {project.concepts.length > concepts.length ? " · …" : ""}
          </p>
        ) : null
      }
    />
  );
}
