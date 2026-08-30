"use client";

import { Chip } from "@/components/ui/tag";
import { Tag } from "@/components/ui/tag";
import { useWorkFilter } from "@/components/work/work-filter";
import type { Skill } from "@/lib/content/queries";
import { evidenceCount } from "@/lib/about/skills";

/**
 * One group of skills, as tags.
 *
 * A skill that names work is a control: pressing it filters Products and Engineering to
 * the projects behind it. A skill that names none is a plain tag — no hover, no press,
 * nothing to disappoint. Every published skill has evidence today, so the second case is
 * a guard rather than a state anyone sees; it exists so that unpublishing the last
 * project a skill points at degrades to a label instead of a dead button.
 *
 * No bars, no radar, no percentages. B2 rules them out and they would be inventing a
 * measurement nobody took.
 */
export function SkillTags({ label, skills }: { label: string; skills: Skill[] }) {
  const { skill: active, select } = useWorkFilter();

  return (
    <div className="skills__group">
      <h3 className="skills__label text-data text-muted">{label}</h3>
      <ul className="skills__list">
        {skills.map((skill) => (
          <li key={skill.slug}>
            {evidenceCount(skill) > 0 ? (
              <Chip
                selected={active?.slug === skill.slug}
                onClick={() => select(skill.slug)}
                // The press does something two sections away, so it says what.
                aria-label={
                  active?.slug === skill.slug
                    ? `${skill.name}: clear the filter`
                    : `${skill.name}: show the work behind it`
                }
              >
                {skill.name}
              </Chip>
            ) : (
              <Tag>{skill.name}</Tag>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
