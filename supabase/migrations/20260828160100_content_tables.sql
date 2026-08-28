-- The content schema from BUILD_PLAN B11.
--
-- Shape shared by every content table: uuid primary key, created_at/updated_at,
-- a unique slug for routing, sort_order for manual ordering, and published which
-- defaults to false so nothing is ever public by accident.

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null,
  summary text,
  body text,
  stack text[] not null default '{}',
  tags text[] not null default '{}',
  cover_image_path text,
  gallery jsonb not null default '[]',
  live_url text,
  repo_url text,
  demo_video_url text,
  status_check_url text,
  outcome text,
  metrics jsonb not null default '{}'
);

comment on table public.products is 'Tech products built and shipped. Rendered as cards on the deck and as case studies at /products/[slug].';

comment on column public.products.status_check_url is 'URL pinged by the live-status route to produce the "live · 84 ms" reading. Null means no status line is shown.';

comment on column public.products.body is 'Markdown case study: problem, what was built, role, outcome, what was learned.';

-- ---------------------------------------------------------------------------
-- engineering_projects
-- ---------------------------------------------------------------------------
create table public.engineering_projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null,
  summary text,
  body text,
  type public.engineering_project_type not null,
  concepts text[] not null default '{}',
  tools text[] not null default '{}',
  cover_image_path text,
  gallery jsonb not null default '[]',
  report_path text,
  repo_url text,
  interactive_widget text,
  data jsonb not null default '{}'
);

comment on table public.engineering_projects is 'Lab, capstone, course and personal engineering work. Detail pages at /engineering/[slug].';

comment on column public.engineering_projects.concepts is 'Concepts applied, e.g. OFDM, OSPF, link budget. Shown as the "concepts applied" line.';

comment on column public.engineering_projects.interactive_widget is 'Identifier of an instrument to render (SNR/BER curve, link budget calculator). Null means no instrument. Only ever set for a project that genuinely has one.';

comment on column public.engineering_projects.data is 'Input data for the instrument named by interactive_widget.';

-- ---------------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------------
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null,
  type public.achievement_type not null,
  event_name text,
  role text,
  result text,
  "date" date,
  city text,
  country text,
  summary text,
  links jsonb not null default '{}',
  media jsonb not null default '{}',
  featured boolean not null default false
);

comment on table public.achievements is 'Competitions, hackathons, programs, awards and talks. Rendered as a traceroute-styled timeline, one hop per row.';

comment on column public.achievements.links is 'Object with optional coverage, video_url, slides_url and repo keys.';

comment on column public.achievements."date" is 'When it happened. Drives timeline ordering; null sorts last.';

-- ---------------------------------------------------------------------------
-- featured_in
-- ---------------------------------------------------------------------------
create table public.featured_in (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null,
  logo_path text,
  url text,
  category public.featured_in_category not null default 'press'
);

comment on table public.featured_in is 'Press, stages and programs. Logos only — no captions or quotes — each linking to the real coverage.';

comment on column public.featured_in.logo_path is 'Path within the logos storage bucket. Monochrome SVG, normalised to one visual height.';

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null,
  category public.skill_category not null,
  linked_slugs text[] not null default '{}'
);

comment on table public.skills is 'Skills split into software/product and telecom/network. Tapping one filters the projects, so every skill must be backed by work.';

comment on column public.skills.linked_slugs is 'Slugs of products and engineering_projects that evidence this skill. An empty array means the skill has no proof and should not be shown.';

-- ---------------------------------------------------------------------------
-- certifications
-- ---------------------------------------------------------------------------
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null,
  issuer text,
  issued_on date,
  credential_url text,
  logo_path text
);

comment on table public.certifications is 'Certifications such as CCNA, which carry real weight in this field.';

-- ---------------------------------------------------------------------------
-- experience
-- ---------------------------------------------------------------------------
create table public.experience (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  org text not null,
  role text,
  type public.experience_type not null,
  start_date date,
  end_date date,
  location text,
  summary text,
  highlights text[] not null default '{}'
);

comment on table public.experience is 'Experience and education timeline: internships, jobs, volunteering, leadership roles and the degree.';

comment on column public.experience.end_date is 'Null means current — rendered as "present".';

-- ---------------------------------------------------------------------------
-- site_settings (exactly one row)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Singleton guard: the column must be true and must be unique, so a second row
  -- is rejected by the database rather than by convention.
  singleton boolean not null default true,
  tagline text,
  eyebrow text,
  quote text,
  quote_author text,
  availability text,
  email text,
  socials jsonb not null default '{}',
  cv_path text,
  hero_primary_label text,
  hero_secondary_label text,
  timezone text not null default 'Asia/Qatar',
  maintenance_message text,
  constraint site_settings_singleton_true check (singleton),
  constraint site_settings_one_row unique (singleton)
);

comment on table public.site_settings is 'The one row of site-wide copy: tagline, eyebrow, quote, availability, hero button labels, socials, CV path, timezone. Constrained to a single row.';

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  ip_hash text,
  user_agent text,
  source text,
  handled boolean not null default false
);

comment on table public.contact_messages is 'Submissions from the contact form. Written only by the server using the service key; the anon role has no policies and no grants here at all.';

comment on column public.contact_messages.ip_hash is 'Hashed, never the raw address. Used only to throttle repeated submissions.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger products_set_updated_at before
update on public.products for each row
execute function public.set_updated_at();

create trigger engineering_projects_set_updated_at before
update on public.engineering_projects for each row
execute function public.set_updated_at();

create trigger achievements_set_updated_at before
update on public.achievements for each row
execute function public.set_updated_at();

create trigger featured_in_set_updated_at before
update on public.featured_in for each row
execute function public.set_updated_at();

create trigger skills_set_updated_at before
update on public.skills for each row
execute function public.set_updated_at();

create trigger certifications_set_updated_at before
update on public.certifications for each row
execute function public.set_updated_at();

create trigger experience_set_updated_at before
update on public.experience for each row
execute function public.set_updated_at();

create trigger site_settings_set_updated_at before
update on public.site_settings for each row
execute function public.set_updated_at();

create trigger contact_messages_set_updated_at before
update on public.contact_messages for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
--
-- Every public read filters on published and orders by sort_order, so those are
-- indexed together. Slugs are already unique-indexed by the constraint.
-- ---------------------------------------------------------------------------
create index products_published_sort_idx on public.products (published, sort_order);

create index engineering_projects_published_sort_idx on public.engineering_projects (published, sort_order);

create index engineering_projects_type_idx on public.engineering_projects (type);

create index achievements_published_sort_idx on public.achievements (published, sort_order);

create index achievements_date_idx on public.achievements ("date" desc nulls last);

create index achievements_type_idx on public.achievements (type);

create index featured_in_published_sort_idx on public.featured_in (published, sort_order);

create index skills_published_sort_idx on public.skills (published, sort_order);

create index skills_category_idx on public.skills (category);

create index certifications_published_sort_idx on public.certifications (published, sort_order);

create index experience_published_sort_idx on public.experience (published, sort_order);

create index experience_start_date_idx on public.experience (start_date desc nulls last);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

create index contact_messages_ip_hash_created_at_idx on public.contact_messages (ip_hash, created_at desc);
