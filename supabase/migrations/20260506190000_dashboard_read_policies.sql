-- Allow authenticated/anon clients to read dashboard datasets with RLS enabled.
drop policy if exists "read_profiles_public" on public.profiles;
create policy "read_profiles_public"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_landlords_public" on public.landlords;
create policy "read_landlords_public"
  on public.landlords
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_properties_public" on public.properties;
create policy "read_properties_public"
  on public.properties
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_units_public" on public.units;
create policy "read_units_public"
  on public.units
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_tenants_public" on public.tenants;
create policy "read_tenants_public"
  on public.tenants
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_payments_public" on public.payments;
create policy "read_payments_public"
  on public.payments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_maintenance_public" on public.maintenance_requests;
create policy "read_maintenance_public"
  on public.maintenance_requests
  for select
  to anon, authenticated
  using (true);

drop policy if exists "read_property_photos_public" on public.property_photos;
create policy "read_property_photos_public"
  on public.property_photos
  for select
  to anon, authenticated
  using (true);
