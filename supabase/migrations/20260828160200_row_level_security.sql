-- Row Level Security, per BUILD_PLAN B11 and B12.
--
-- Two independent gates, deliberately:
--
--   1. GRANTs decide whether a role can see the table through the Data API at all.
--   2. Policies decide which rows it may read.
--
-- The project was created with "automatically expose new tables" switched off, so
-- nothing reaches the API until it is granted here by name. That means a table added
-- later is invisible by default: the failure mode is a page that cannot load its
-- content, not a table quietly readable by the public.
--
-- The anon role gets SELECT and nothing else. There is no INSERT, UPDATE or DELETE
-- policy anywhere in this file for anon, so writes are impossible through the public
-- API even if a GRANT were added by mistake. The server writes with the service key,
-- which bypasses RLS.
--
-- contact_messages appears in the enable and service_role sections only. It is never
-- granted to anon and has no anon policy, which is what makes it unreadable rather
-- than merely unread.
-- ---------------------------------------------------------------------------
-- 1. Enable RLS everywhere. With no policy attached, this denies by default.
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

alter table public.engineering_projects enable row level security;

alter table public.achievements enable row level security;

alter table public.featured_in enable row level security;

alter table public.skills enable row level security;

alter table public.certifications enable row level security;

alter table public.experience enable row level security;

alter table public.site_settings enable row level security;

alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Schema access
-- ---------------------------------------------------------------------------
grant usage on schema public to anon,
service_role;

-- ---------------------------------------------------------------------------
-- 3. The server's own role. Bypasses RLS, but still needs table privileges.
-- ---------------------------------------------------------------------------
grant all on public.products to service_role;

grant all on public.engineering_projects to service_role;

grant all on public.achievements to service_role;

grant all on public.featured_in to service_role;

grant all on public.skills to service_role;

grant all on public.certifications to service_role;

grant all on public.experience to service_role;

grant all on public.site_settings to service_role;

grant all on public.contact_messages to service_role;

-- ---------------------------------------------------------------------------
-- 4. Public read access: SELECT only, published rows only.
-- ---------------------------------------------------------------------------
grant select on public.products to anon;

grant select on public.engineering_projects to anon;

grant select on public.achievements to anon;

grant select on public.featured_in to anon;

grant select on public.skills to anon;

grant select on public.certifications to anon;

grant select on public.experience to anon;

grant select on public.site_settings to anon;

create policy "Anyone can read published products" on public.products for
select
  to anon using (published);

create policy "Anyone can read published engineering projects" on public.engineering_projects for
select
  to anon using (published);

create policy "Anyone can read published achievements" on public.achievements for
select
  to anon using (published);

create policy "Anyone can read published featured_in entries" on public.featured_in for
select
  to anon using (published);

create policy "Anyone can read published skills" on public.skills for
select
  to anon using (published);

create policy "Anyone can read published certifications" on public.certifications for
select
  to anon using (published);

create policy "Anyone can read published experience" on public.experience for
select
  to anon using (published);

-- site_settings has no published column: it is the site's own copy, and there is
-- exactly one row. Reading it is the whole point.
create policy "Anyone can read site settings" on public.site_settings for
select
  to anon using (true);

-- ---------------------------------------------------------------------------
-- 5. contact_messages: explicitly closed to the public API.
--
-- The REVOKE is belt and braces — nothing granted it in the first place — but it
-- makes the intent auditable in the schema instead of implied by absence.
-- ---------------------------------------------------------------------------
revoke all on public.contact_messages
from
  anon;
