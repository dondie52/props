-- Support onboarding photo uploads to Supabase Storage + metadata table writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_photos_public_read" on storage.objects;
create policy "property_photos_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'property-photos');

drop policy if exists "property_photos_authenticated_insert" on storage.objects;
create policy "property_photos_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'property-photos');

drop policy if exists "property_photos_authenticated_update" on storage.objects;
create policy "property_photos_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'property-photos')
  with check (bucket_id = 'property-photos');

drop policy if exists "property_photos_authenticated_delete" on storage.objects;
create policy "property_photos_authenticated_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'property-photos');

drop policy if exists "property_photos_authenticated_insert_row" on public.property_photos;
create policy "property_photos_authenticated_insert_row"
  on public.property_photos
  for insert
  to authenticated
  with check (true);
