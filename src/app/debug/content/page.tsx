import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import {
  getAchievements,
  getCertifications,
  getEngineeringProjects,
  getExperience,
  getFeaturedIn,
  getProducts,
  getSiteSettings,
  getSkills,
} from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Content — debug",
  robots: { index: false, follow: false },
};

/**
 * Everything the data layer returns, on one page, so seeded content can be eyeballed
 * before any real section is built against it.
 *
 * Development only. Not flag-gated like /design — that route exists to be reviewed on a
 * real phone, whereas this one is a working tool that should never be reachable in
 * production at all.
 *
 * It is deliberately plain: a spec sheet in the token styles, not a designed page. Its
 * job is to make a missing field obvious, which is why gaps render as a visible "null"
 * rather than as empty space that reads as fine.
 */
export const dynamic = "force-dynamic";

function Missing() {
  return <span className="text-data text-danger">null</span>;
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  const empty =
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  return (
    <div className="flex flex-col gap-1 border-t border-line py-2 sm:flex-row sm:gap-4">
      <span className="text-data w-full shrink-0 text-muted sm:w-48">{label}</span>
      <span className="text-small min-w-0 break-words text-ink">{empty ? <Missing /> : value}</span>
    </div>
  );
}

function List({ values }: { values: string[] }) {
  if (values.length === 0) return <Missing />;
  return (
    <span className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Tag key={value}>{value}</Tag>
      ))}
    </span>
  );
}

function Json({ value }: { value: unknown }) {
  const text = JSON.stringify(value);
  if (!text || text === "{}" || text === "[]") return <Missing />;
  // normal-case overrides the uppercase in text-data: these are URLs and keys, and
  // uppercasing a URL path changes what it points at.
  return <code className="text-data text-ink normal-case">{text}</code>;
}

function Group({
  title,
  count,
  published,
  children,
}: {
  title: string;
  count: number;
  published?: number;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-10 pb-10">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-h3 text-ink">{title}</h2>
        <span className="text-data text-muted">
          {published === undefined ? `${count} rows` : `${count} published of ${published} seeded`}
        </span>
      </div>
      {count === 0 ? (
        <Card>
          <p className="text-body text-ink">Nothing published.</p>
          <p className="mt-1 text-small text-muted">
            Either it has not been seeded, or every row has published set to false.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">{children}</div>
      )}
    </section>
  );
}

export default async function DebugContentPage() {
  // Never built into a production bundle. The check is on NODE_ENV rather than a flag
  // so there is no switch anyone could turn on by accident.
  if (process.env.NODE_ENV === "production") notFound();

  // Without credentials every fetcher would throw and the page would 500. A tool that
  // dies when it is most needed is not a tool, so it says what is wrong instead.
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-dvh flex-col justify-center gap-3 px-6 sm:px-10 lg:px-16">
        <p className="text-data text-muted">Development only · not in production</p>
        <h1 className="text-h1 text-ink">No database configured</h1>
        <p className="measure text-body text-muted">
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Copy .env.example
          to .env.local and fill them in, then reload.
        </p>
      </main>
    );
  }

  const [
    settings,
    products,
    engineering,
    achievements,
    featuredIn,
    skills,
    certifications,
    experience,
  ] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getEngineeringProjects(),
    getAchievements(),
    getFeaturedIn(),
    getSkills(),
    getCertifications(),
    getExperience(),
  ]);

  return (
    <main className="min-h-dvh px-6 pb-24 sm:px-10 lg:px-16">
      <header className="flex flex-col gap-3 py-10">
        <p className="text-data text-muted">Development only · not in production</p>
        <h1 className="text-h1 text-ink">Content</h1>
        <p className="measure text-body text-muted">
          Everything the data layer returns, exactly as a page would receive it. Fields shown in{" "}
          <Missing /> are gaps, not errors.
        </p>
      </header>

      <Group title="Site settings" count={settings ? 1 : 0}>
        {settings ? (
          <Card>
            <Field label="tagline" value={settings.tagline} />
            <Field label="eyebrow" value={settings.eyebrow} />
            <Field label="quote" value={settings.quote} />
            <Field label="quote_author" value={settings.quote_author} />
            <Field label="availability" value={settings.availability} />
            <Field label="email" value={settings.email} />
            <Field label="socials" value={<Json value={settings.socials} />} />
            <Field label="cv_path" value={settings.cv_path} />
            <Field label="hero_primary_label" value={settings.hero_primary_label} />
            <Field label="hero_secondary_label" value={settings.hero_secondary_label} />
            <Field label="timezone" value={settings.timezone} />
          </Card>
        ) : null}
      </Group>

      <Group title="Products" count={products.length}>
        {products.map((product) => (
          <Card key={product.id}>
            <h3 className="text-h3 text-ink">{product.title}</h3>
            <Field label="slug" value={product.slug} />
            <Field label="summary" value={product.summary} />
            <Field label="stack" value={<List values={product.stack} />} />
            <Field label="live_url" value={product.live_url} />
            <Field label="repo_url" value={product.repo_url} />
            <Field label="status_check_url" value={product.status_check_url} />
            <Field label="cover_image_path" value={product.cover_image_path} />
            <Field label="body" value={product.body} />
            <Field label="outcome" value={product.outcome} />
            <Field label="metrics" value={<Json value={product.metrics} />} />
          </Card>
        ))}
      </Group>

      <Group title="Engineering projects" count={engineering.length}>
        {engineering.map((project) => (
          <Card key={project.id}>
            <h3 className="text-h3 text-ink">{project.title}</h3>
            <Field label="slug" value={project.slug} />
            <Field label="type" value={project.type} />
            <Field label="summary" value={project.summary} />
            <Field label="concepts" value={<List values={project.concepts} />} />
            <Field label="tools" value={<List values={project.tools} />} />
            <Field label="cover_image_path" value={project.cover_image_path} />
            <Field label="report_path" value={project.report_path} />
            <Field label="repo_url" value={project.repo_url} />
            <Field label="interactive_widget" value={project.interactive_widget} />
          </Card>
        ))}
      </Group>

      <Group title="Achievements and talks" count={achievements.length}>
        {achievements.map((entry) => (
          <Card key={entry.id}>
            <h3 className="text-h3 text-ink">{entry.title}</h3>
            <Field label="type" value={entry.type} />
            <Field label="event_name" value={entry.event_name} />
            <Field label="role" value={entry.role} />
            <Field label="result" value={entry.result} />
            <Field label="date" value={entry.date} />
            <Field
              label="city / country"
              value={[entry.city, entry.country].filter(Boolean).join(", ")}
            />
            <Field label="summary" value={entry.summary} />
            <Field label="links" value={<Json value={entry.links} />} />
          </Card>
        ))}
      </Group>

      <Group title="Featured in" count={featuredIn.length}>
        {featuredIn.map((entry) => (
          <Card key={entry.id}>
            <h3 className="text-h3 text-ink">{entry.name}</h3>
            <Field label="category" value={entry.category} />
            <Field label="url" value={entry.url} />
            <Field label="logo_path" value={entry.logo_path} />
          </Card>
        ))}
      </Group>

      <Group title="Skills" count={skills.length}>
        <Card>
          {skills.map((skill) => (
            <Field
              key={skill.id}
              label={skill.category}
              value={
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-ink">{skill.name}</span>
                  <span className="text-data text-muted">
                    backs {skill.linked_slugs.length} item
                    {skill.linked_slugs.length === 1 ? "" : "s"}
                  </span>
                </span>
              }
            />
          ))}
        </Card>
      </Group>

      <Group title="Certifications" count={certifications.length}>
        {certifications.map((certification) => (
          <Card key={certification.id}>
            <h3 className="text-h3 text-ink">{certification.name}</h3>
            <Field label="issuer" value={certification.issuer} />
            <Field label="issued_on" value={certification.issued_on} />
            <Field label="credential_url" value={certification.credential_url} />
          </Card>
        ))}
      </Group>

      <Group title="Experience and education" count={experience.length}>
        {experience.map((entry) => (
          <Card key={entry.id}>
            <h3 className="text-h3 text-ink">
              {entry.role ? `${entry.role} · ` : ""}
              {entry.org}
            </h3>
            <Field label="type" value={entry.type} />
            <Field label="start_date" value={entry.start_date} />
            <Field label="end_date" value={entry.end_date ?? "present"} />
            <Field label="location" value={entry.location} />
            <Field label="summary" value={entry.summary} />
            <Field label="highlights" value={<List values={entry.highlights} />} />
          </Card>
        ))}
      </Group>
    </main>
  );
}
