import type { Metadata } from "next";
import Link from "next/link";
import { EngineeringCard } from "@/components/engineering/engineering-card";
import { getEngineeringProjects } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Engineering — Fadi Muhammed",
  description: "Lab and course work, with the concepts applied and what the measurements showed.",
};

export default async function EngineeringIndex() {
  const projects = await getEngineeringProjects();

  return (
    <main className="detail" id="main">
      <p className="detail__back text-data">
        <Link href="/#engineering">
          <span aria-hidden="true">←</span> Back to the deck
        </Link>
      </p>

      <header className="detail__head">
        <h1 className="text-h1 text-ink">Engineering</h1>
        <p className="detail__summary text-body text-muted measure">
          Lab and course work, with the concepts applied and what the measurements showed.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-body text-ink measure">
          Nothing here yet. The lab and course work is being written up.
        </p>
      ) : (
        <ul className="product-grid">
          {projects.map((project) => (
            <li key={project.slug}>
              <EngineeringCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
