import { storageUrl } from "@/lib/content/media";
import { groupSkills } from "@/lib/about/skills";
import type { Certification, Experience, Skill, SiteSettings } from "@/lib/content/queries";
import { Link } from "@/components/ui/link";
import { SkillTags } from "./skill-tags";
import { Timeline } from "./timeline";
import { CvButton } from "./cv-button";

/**
 * The About stop on the deck (B2 item 6).
 *
 * Deliberately the quietest section on the site. Everything above it argues; this one
 * answers the questions that argument raises — who, what with, since when — and then
 * stops. The only interaction is the skill filter, and the only reason that exists is
 * that it makes a claim checkable.
 *
 * Two columns at width: the reading on the left, the record on the right. The bio is
 * prose and wants a measure; the timeline, the certifications and the CV are a column of
 * facts and want to be scanned. Stacking them at 390 puts the prose first, which is the
 * order they should be read in anyway.
 */

type Props = {
  settings: SiteSettings | null;
  skills: Skill[];
  certifications: Certification[];
  experience: Experience[];
};

export function AboutSection({ settings, skills, certifications, experience }: Props) {
  const groups = groupSkills(skills);
  const cvUrl = storageUrl("documents", settings?.cv_path);

  const hasAnything =
    settings?.bio || groups.length > 0 || certifications.length > 0 || experience.length > 0;

  if (!hasAnything) {
    return (
      <div className="section-body">
        <p className="text-body text-ink measure">Nothing here yet.</p>
      </div>
    );
  }

  return (
    <div className="section-body about" data-inner-scroll>
      <div className="about__reading">
        {settings?.bio ? <p className="about__bio text-body text-ink">{settings.bio}</p> : null}

        {settings?.currently ? (
          <p className="about__currently">
            <span className="text-data text-muted">Currently</span>{" "}
            <span className="text-body text-ink">{settings.currently}</span>
          </p>
        ) : null}

        {groups.length > 0 ? (
          <div className="skills">
            {groups.map((group) => (
              <SkillTags key={group.category} label={group.label} skills={group.skills} />
            ))}
          </div>
        ) : null}

        {/* The CV sits in the reading column rather than under the timeline. Beneath the
            record it fell below the fold of the section's own scroll, and a download
            nobody can see is not a call to action. */}
        {cvUrl ? <CvButton href={cvUrl} /> : null}
      </div>

      <div className="about__record">
        {experience.length > 0 ? <Timeline entries={experience} /> : null}

        {certifications.length > 0 ? (
          <section className="about__block" aria-labelledby="about-certifications">
            <h3 id="about-certifications" className="text-data text-muted">
              Certifications
            </h3>
            <ul className="certs">
              {certifications.map((certification) => (
                <li key={certification.slug} className="certs__item">
                  <p className="text-body text-ink">
                    {certification.credential_url ? (
                      <Link href={certification.credential_url} external>
                        {certification.name}
                      </Link>
                    ) : (
                      certification.name
                    )}
                  </p>
                  {/* Issuer and date are printed only when they exist. A dash standing in
                      for a date says the same nothing, with more ink. */}
                  {certification.issuer ? (
                    <p className="text-small text-muted">{certification.issuer}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
