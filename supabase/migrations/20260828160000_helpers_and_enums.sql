-- Shared helpers and the typed enums used by the content schema.
--
-- Enums rather than free text: the values in BUILD_PLAN B11 are a closed set, and a
-- typo in a `type` column would silently drop a row out of a filter rather than fail.

-- Stamps updated_at on every UPDATE. search_path is pinned empty so the function
-- cannot be hijacked by a schema earlier on a caller's search path.
create or replace function public.set_updated_at() returns trigger language plpgsql
set
  search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is 'Trigger function: stamps updated_at on every UPDATE.';

create type public.engineering_project_type as enum('lab', 'capstone', 'course', 'personal');

create type public.achievement_type as enum(
  'hackathon',
  'competition',
  'talk',
  'award',
  'program'
);

create type public.featured_in_category as enum('press', 'stage', 'program');

create type public.skill_category as enum('software', 'telecom');

create type public.experience_type as enum(
  'internship',
  'job',
  'volunteer',
  'leadership',
  'education'
);
