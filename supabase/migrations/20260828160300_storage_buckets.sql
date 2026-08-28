-- Storage buckets, per BUILD_PLAN B11.
--
--   media      covers, gallery images, photos
--   logos      featured-in logos, monochrome SVG
--   documents  the CV and engineering project reports
--
-- All three are public read: these are files meant to be linked from a portfolio,
-- and putting them behind signed URLs would buy nothing but latency.
--
-- Writing is another matter. No insert, update or delete policy is created for anon,
-- so uploads happen through Supabase Studio or the upload script using the service
-- key, and never from a browser.
insert into
  storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('logos', 'logos', true),
  ('documents', 'documents', true)
on conflict (id) do nothing;

-- Public buckets are already served over the public object path, but an explicit
-- read policy is what allows listing and keeps the intent visible in the schema
-- rather than depending on a dashboard toggle nobody can see in a diff.
create policy "Anyone can read media" on storage.objects for
select
  to anon using (bucket_id = 'media');

create policy "Anyone can read logos" on storage.objects for
select
  to anon using (bucket_id = 'logos');

create policy "Anyone can read documents" on storage.objects for
select
  to anon using (bucket_id = 'documents');
