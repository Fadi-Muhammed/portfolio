import { z } from "zod";

/**
 * Zod mirrors of the database schema, used to validate content/seed/*.json before
 * anything is written to Postgres.
 *
 * The database already enforces most of this, but a failed insert reports one row at a
 * time with a Postgres error. Validating here fails the whole seed with every problem
 * listed and the file and field named, which is the difference between fixing content
 * in one pass and fixing it in nine.
 *
 * Nullable vs optional matters: `.nullable()` means "known to be absent", which is what
 * an unfilled gap is. Optional would let a typo in a key pass silently as missing.
 */

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    error: "slug must be lowercase words separated by single hyphens",
  });

const url = z.url().nullable();
const text = z.string().min(1).nullable();

/** Every content table carries these. `published` is explicit in the seed files, never defaulted. */
const contentBase = z.object({
  slug,
  sort_order: z.number().int(),
  published: z.boolean(),
});

export const productSchema = contentBase.extend({
  title: z.string().min(1),
  summary: text,
  body: text,
  stack: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
  cover_image_path: text,
  gallery: z.array(z.unknown()),
  live_url: url,
  repo_url: url,
  demo_video_url: url,
  status_check_url: url,
  outcome: text,
  metrics: z.record(z.string(), z.unknown()),
});

export const engineeringProjectSchema = contentBase.extend({
  title: z.string().min(1),
  summary: text,
  body: text,
  type: z.enum(["lab", "capstone", "course", "personal"]),
  concepts: z.array(z.string().min(1)),
  tools: z.array(z.string().min(1)),
  cover_image_path: text,
  gallery: z.array(z.unknown()),
  report_path: text,
  repo_url: url,
  interactive_widget: text,
  data: z.record(z.string(), z.unknown()),
});

export const achievementSchema = contentBase.extend({
  title: z.string().min(1),
  type: z.enum(["hackathon", "competition", "talk", "award", "program"]),
  event_name: text,
  role: text,
  result: text,
  // ISO date, or null when the date is genuinely not known yet.
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "date must be YYYY-MM-DD" })
    .nullable(),
  city: text,
  country: text,
  summary: text,
  links: z.record(z.string(), z.unknown()),
  media: z.record(z.string(), z.unknown()),
  featured: z.boolean(),
});

export const featuredInSchema = contentBase.extend({
  name: z.string().min(1),
  logo_path: text,
  url,
  category: z.enum(["press", "stage", "program"]),
});

export const skillSchema = contentBase.extend({
  name: z.string().min(1),
  category: z.enum(["software", "telecom"]),
  // Slugs of products and engineering_projects that evidence this skill. Empty means
  // the skill has no proof yet, which is why it should not be published.
  linked_slugs: z.array(slug),
});

export const certificationSchema = contentBase.extend({
  name: z.string().min(1),
  issuer: text,
  issued_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "issued_on must be YYYY-MM-DD" })
    .nullable(),
  credential_url: url,
  logo_path: text,
});

export const experienceSchema = contentBase.extend({
  org: z.string().min(1),
  role: text,
  type: z.enum(["internship", "job", "volunteer", "leadership", "education"]),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "start_date must be YYYY-MM-DD" })
    .nullable(),
  // Null means current, rendered as "present".
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "end_date must be YYYY-MM-DD" })
    .nullable(),
  location: text,
  summary: text,
  highlights: z.array(z.string().min(1)),
  // An object in the `logos` bucket, as featured_in and certifications also use. Most
  // rows have none, and a row without one renders without one.
  logo_path: text,
});

/** One row, so no slug, no sort_order, no published. */
export const siteSettingsSchema = z.object({
  tagline: text,
  // The About section's prose (B2 item 6). Plain text rather than markdown: it is two
  // short pieces of copy, and a renderer would be more machinery than they justify.
  bio: text,
  currently: text,
  eyebrow: text,
  quote: text,
  quote_author: text,
  availability: text,
  email: text,
  socials: z.record(z.string(), z.string()),
  cv_path: text,
  hero_primary_label: text,
  hero_secondary_label: text,
  timezone: z.string().min(1),
  maintenance_message: text,
});

/**
 * Every seeded table, keyed by the table name it upserts into. The seed script walks
 * this, so adding a table means adding one entry here and one JSON file.
 */
export const seedTables = {
  products: productSchema,
  engineering_projects: engineeringProjectSchema,
  achievements: achievementSchema,
  featured_in: featuredInSchema,
  skills: skillSchema,
  certifications: certificationSchema,
  experience: experienceSchema,
} as const;

export type SeedTable = keyof typeof seedTables;

export type Product = z.infer<typeof productSchema>;
export type EngineeringProject = z.infer<typeof engineeringProjectSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type FeaturedIn = z.infer<typeof featuredInSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
