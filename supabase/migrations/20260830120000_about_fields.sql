-- Part 12: the three columns the About section needs and B11 did not specify.
--
-- site_settings.bio and .currently hold the two pieces of prose B2 item 6 asks for. They
-- belong here rather than in a table of their own for the same reason the tagline does:
-- there is exactly one of each, and they are edited in Studio beside the copy they sit
-- next to on the page.
--
-- experience.logo_path names an object in the `logos` bucket, matching featured_in and
-- certifications, so the three places a logo can appear all address storage the same way.
-- Most rows will have none, and a row without one renders without one.

alter table public.site_settings
add column if not exists bio text,
add column if not exists currently text;

alter table public.experience
add column if not exists logo_path text;

comment on column public.site_settings.bio is 'Short About paragraph. Plain text, not markdown.';

comment on column public.site_settings.currently is 'One line: what is happening right now.';

comment on column public.experience.logo_path is 'Object path inside the logos bucket, e.g. udst.svg.';
