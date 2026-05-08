-- Let landlords prepare tenant profile rows when assigning tenants to managed units.

grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "profiles_select_scoped" on public.profiles;
drop policy if exists "profiles_insert_tenant_invite" on public.profiles;
drop policy if exists "profiles_update_tenant_invite" on public.profiles;

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
      where lower(t.email) = lower(profiles.email)
        and private.can_manage_property(u.property_id)
    )
  );

create policy "profiles_insert_tenant_invite"
  on public.profiles
  for insert
  to authenticated
  with check (
    role = 'tenant'
    and auth_user_id is null
    and (private.current_profile_role() in ('landlord', 'admin'))
  );

create policy "profiles_update_tenant_invite"
  on public.profiles
  for update
  to authenticated
  using (
    private.is_admin()
    or id = private.current_profile_id()
    or (
      role = 'tenant'
      and auth_user_id is null
      and exists (
        select 1
        from public.tenants t
        join public.units u on u.id = t.unit_id
        where lower(t.email) = lower(profiles.email)
          and private.can_manage_property(u.property_id)
      )
    )
  )
  with check (
    private.is_admin()
    or id = private.current_profile_id()
    or (
      role = 'tenant'
      and auth_user_id is null
      and exists (
        select 1
        from public.tenants t
        join public.units u on u.id = t.unit_id
        where lower(t.email) = lower(profiles.email)
          and private.can_manage_property(u.property_id)
      )
    )
  );
