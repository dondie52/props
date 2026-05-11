-- Allow tenants to read their landlord's profile row for the property they lease on (needed before a conversation exists).

drop policy if exists "profiles_select_scoped" on public.profiles;

create policy "profiles_select_scoped"
  on public.profiles
  for select
  to authenticated
  using (
    private.is_admin()
    or id = private.current_profile_id()
    or exists (
      select 1
      from public.conversations c
      where private.current_profile_id() in (c.landlord_profile_id, c.tenant_profile_id)
        and profiles.id in (c.landlord_profile_id, c.tenant_profile_id)
    )
    or exists (
      select 1
      from public.tenants t
      join public.units u on u.id = t.unit_id
      join public.properties p on p.id = u.property_id
      join public.landlords l on l.id = p.landlord_id
      where lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and l.profile_id is not null
        and profiles.id = l.profile_id
    )
    or exists (
      select 1
      from public.tenants t
      join public.units u on u.id = t.unit_id
      where lower(t.email) = lower(profiles.email)
        and private.can_manage_property(u.property_id)
    )
  );
