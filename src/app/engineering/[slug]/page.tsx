import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Instrument } from "@/components/engineering/instruments/registry";
import { CopyLink } from "@/components/products/copy-link";
import { Tag } from "@/components/ui/tag";
import { Markdown } from "@/lib/content/markdown";
import { galleryImages, mediaUrl, storageUrl } from "@/lib/content/media";
import { getEngineeringProject, getEngineeringProjects } from "@/lib/content/queries";

/**
 * An engineering project.
 *
 * Deliberately the same layout as a product case study — same shell, same aside, same
 * prose scale — because they are the same kind of page and a visitor moving between them
 * should not have to reorient. What differs is what the aside holds: concepts and tools
 * instead of a stack and a metric, and a report where a product has a demo.
 */

export async function generateStaticParams() {
  const projects = await getEngineeringProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getEngineeringProject(slug);
  if (!project) return { title: "Route not found" };

  return {
    title: `${project.title} — Fadi Muhammed`,
    description: project.summary ?? undefined,
  };
}

const TYPE_LABEL: Record<string, string> = {
  lab: "Lab",
  capstone: "Capstone",
  course: "Course work",
  personal: "Personal",
};

export default async function EngineeringPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([
    getEngineeringProject(slug),
    getEngineeringProjects(),
  ]);
  if (!project) notFound();

  const cover = mediaUrl(project.cover_image_path);
  const gallery = galleryImages(project.gallery).filter(
    (image) => image.path !== project.cover_image_path,
  );
  const report = storageUrl("documents", project.report_path);

  const index = projects.findIndex((entry) => entry.slug === project.slug);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null;

  return (
    <main className="detail" id="main">
      <p className="detail__back text-data">
        <Link href="/#engineering">
          <span aria-hidden="true">←</span> Back to engineering
        </Link>
      </p>

      <header className="detail__head">
        <p className="text-data text-muted">{TYPE_LABEL[project.type] ?? project.type}</p>
        <h1 className="text-h1 text-ink">{project.title}</h1>
        {project.summary ? (
          <p className="detail__summary text-body text-muted measure">{project.summary}</p>
        ) : null}
      </header>

      {cover ? (
        <Image
          src={cover}
          alt={`${project.title} on the bench`}
          width={1917}
          height={1080}
          priority
          className="detail__cover"
          style={{ viewTransitionName: `cover-${project.slug}` }}
          sizes="(min-width: 64rem) 72rem, 100vw"
        />
      ) : null}

      <div className="detail__grid">
        <div className="detail__body">
          <Markdown>{project.body}</Markdown>

          {/*
            The instrument sits inside the reading column, after the method, because it is
            an argument in the text rather than an illustration beside it: the reader has
            just been told how the loop works and can now move it.
          */}
          <Instrument project={project} />
        </div>

        <aside className="detail__aside">
          {project.concepts.length > 0 ? (
            <section>
              <h2 className="text-data text-muted">Concepts applied</h2>
              <ul className="detail__tags">
                {project.concepts.map((entry) => (
                  <li key={entry}>
                    <Tag>{entry}</Tag>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {project.tools.length > 0 ? (
            <section>
              <h2 className="text-data text-muted">Tools</h2>
              <ul className="detail__tags">
                {project.tools.map((entry) => (
                  <li key={entry}>
                    <Tag>{entry}</Tag>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="text-data text-muted">Links</h2>
            <ul className="detail__links">
              {report ? (
                <li>
                  <a href={report} target="_blank" rel="noopener noreferrer">
                    Report (PDF) <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ) : null}
              {project.repo_url ? (
                <li>
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                    Source <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ) : null}
              <li>
                <CopyLink />
              </li>
            </ul>
          </section>
        </aside>
      </div>

      {gallery.length > 0 ? (
        <section className="detail__gallery" aria-label="Photographs and diagrams">
          {gallery.map((image) => {
            const url = mediaUrl(image.path);
            return url ? (
              <figure key={image.path}>
                <Image
                  src={url}
                  alt=""
                  width={1917}
                  height={1080}
                  loading="lazy"
                  sizes="(min-width: 64rem) 72rem, 100vw"
                />
                <figcaption className="text-small text-muted">{image.alt}</figcaption>
              </figure>
            ) : null;
          })}
        </section>
      ) : null}

      {previous || next ? (
        <nav className="detail__nav" aria-label="Other engineering projects">
          {previous ? (
            <Link href={`/engineering/${previous.slug}`}>
              <span className="text-data text-muted">Previous</span>
              <span className="text-h3 text-ink">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/engineering/${next.slug}`} className="detail__nav-next">
              <span className="text-data text-muted">Next</span>
              <span className="text-h3 text-ink">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
