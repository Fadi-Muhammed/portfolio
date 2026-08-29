import Link from "next/link";
import type { EngineeringProject } from "@/lib/content/queries";
import { EngineeringCard } from "./engineering-card";

/**
 * The Engineering stop on the deck (B2 item 3).
 *
 * The same card pattern and the same four-before-the-link rule as Products, because they
 * are the same kind of list and a visitor should not have to learn two.
 *
 * No filter chips. B2 asks for them by type — lab, capstone, course, personal — and Part
 * 9's prompt makes them conditional on there being enough projects. With one project and
 * one type, a filter is a control that can only ever do nothing.
 */

const CARDS_IN_DECK = 4;

export function EngineeringSection({ projects }: { projects: EngineeringProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="section-body">
        <p className="text-body text-ink measure">
          Nothing here yet. The lab and course work is being written up.
        </p>
        <p className="text-small text-muted measure mt-2">
          The shipped products are further up the deck, and everything is reachable from search.
        </p>
      </div>
    );
  }

  const shown = projects.slice(0, CARDS_IN_DECK);

  return (
    <div className="section-body">
      <p className="section-intro text-body text-ink measure">
        Lab and course work. Each one lists the concepts it applied and the tools it used, and says
        what the measurements actually showed.
      </p>

      <ul className="work-strip" data-count={shown.length}>
        {shown.map((project) => (
          <li key={project.slug} className="work-strip__item">
            <EngineeringCard project={project} />
          </li>
        ))}
      </ul>

      {projects.length > CARDS_IN_DECK ? (
        <p className="section-more">
          <Link href="/engineering" className="text-small">
            All engineering projects <span aria-hidden="true">→</span>
          </Link>
        </p>
      ) : null}
    </div>
  );
}
