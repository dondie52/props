-- Secure dashboard access with auth-linked profiles and ownership-scoped RLS.

create schema if not exists private;
revoke all on schema private from anon, authenticated;

create or replace function private.current_profile_id()
returns uuid
language sql
security definer
stable
set search_path = public, auth
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
     or (
       p.auth_user_id is null
       and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
     )
  order by (p.auth_user_id = auth.uid()) desc
  limit 1
$$;

create or replace function private.current_profile_role()
returns text
language sql
security definer
stable
set search_path = public, auth
as $$
  select p.role
  from public.profiles p
  where p.id = private.current_profile_id()
  limit 1
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select coalesce(private.current_profile_role() = 'admin', false)
$$;

create or replace function private.current_landlord_id()
returns uuid
language sql
security definer
stable
set search_path = public, auth
as $$
  select l.id
  from public.landlords l
  where l.profile_id = private.current_profile_id()
  limit 1
$$;

create or replace function private.can_manage_landlord(landlord_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select private.is_admin() or landlord_id = private.current_landlord_id()
$$;

create or replace function private.can_manage_property(property_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.properties p
    where p.id = property_id
      and private.can_manage_landlord(p.landlord_id)
  )
$$;

create or replace function private.can_access_unit(unit_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select private.is_admin()
    or exists (
      select 1
      from public.units u
      where u.id = unit_id
        and private.can_manage_property(u.property_id)
    )
    or exists (
      select 1
      from public.tenants t
      where t.unit_id = unit_id
        and lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
$$;

create or replace function private.can_access_tenant(tenant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select private.is_admin()
    or exists (
      select 1
      from public.tenants t
      join public.units u on u.id = t.unit_id
      where t.id = tenant_id
        and private.can_manage_property(u.property_id)
    )
    or exists (
      select 1
      from public.tenants t
      where t.id = tenant_id
        and lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
$$;

create or replace function private.uuid_from_text(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  return value::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_profile_id uuid;
  requested_role text;
  requested_name text;
begin
  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'role', 'landlord'));
  if requested_role not in ('landlord', 'tenant') then
    requested_role := 'landlord';
  end if;

  requested_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  if requested_name is null then
    requested_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (auth_user_id, full_name, email, role)
  values (new.id, requested_name, lower(new.email), requested_role)
  on conflict (email) do update
  set auth_user_id = excluded.auth_user_id,
      full_name = excluded.full_name,
      role = excluded.role
  returning id into new_profile_id;

  if requested_role = 'landlord' then
    insert into public.landlords (profile_id, full_name, email)
    values (new_profile_id, requested_name, lower(new.email))
    on conflict (profile_id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_propmanage_profile on auth.users;
create trigger on_auth_user_created_propmanage_profile
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

revoke all privileges on table
  public.profiles,
  public.landlords,
  public.properties,
  public.units,
  public.tenants,
  public.payments,
  public.maintenance_requests,
  public.property_photos,
  public.conversations,
  public.messages
from anon;

grant select, update on table public.profiles to authenticated;
grant select on table public.landlords to authenticated;
grant select, insert, update, delete on table public.properties to authenticated;
grant select, insert, update, delete on table public.units to authenticated;
grant select, insert, update, delete on table public.tenants to authenticated;
grant select, insert, update, delete on table public.payments to authenticated;
grant select, insert, update, delete on table public.maintenance_requests to authenticated;
grant select, insert, update, delete on table public.property_photos to authenticated;
grant select, insert, update on table public.conversations to authenticated;
grant select, insert, update on table public.messages to authenticated;

alter table public.profiles enable row level security;
alter table public.landlords enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.property_photos enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "read_profiles_public" on public.profiles;
drop policy if exists "read_landlords_public" on public.landlords;
drop policy if exists "read_properties_public" on public.properties;
drop policy if exists "read_units_public" on public.units;
drop policy if exists "read_tenants_public" on public.tenants;
drop policy if exists "read_payments_public" on public.payments;
drop policy if exists "read_maintenance_public" on public.maintenance_requests;
drop policy if exists "read_property_photos_public" on public.property_photos;
drop policy if exists "property_photos_authenticated_insert_row" on public.property_photos;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "conversations_select_participant" on public.conversations;
drop policy if exists "conversations_insert_participant" on public.conversations;
drop policy if exists "conversations_update_participant" on public.conversations;
drop policy if exists "messages_select_participant" on public.messages;
drop policy if exists "messages_insert_sender_participant" on public.messages;
drop policy if exists "messages_update_participant" on public.messages;

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
  );

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = private.current_profile_id() or private.is_admin())
  with check (id = private.current_profile_id() or private.is_admin());

create policy "landlords_select_scoped"
  on public.landlords
  for select
  to authenticated
  using (private.is_admin() or profile_id = private.current_profile_id());

create policy "properties_select_scoped"
  on public.properties
  for select
  to authenticated
  using (
    private.can_manage_landlord(landlord_id)
    or exists (
      select 1
      from public.units u
      join public.tenants t on t.unit_id = u.id
      where u.property_id = properties.id
        and lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "properties_write_owner"
  on public.properties
  for all
  to authenticated
  using (private.can_manage_landlord(landlord_id))
  with check (private.can_manage_landlord(landlord_id));

create policy "units_select_scoped"
  on public.units
  for select
  to authenticated
  using (private.can_access_unit(id));

create policy "units_write_owner"
  on public.units
  for all
  to authenticated
  using (private.can_manage_property(property_id))
  with check (private.can_manage_property(property_id));

create policy "tenants_select_scoped"
  on public.tenants
  for select
  to authenticated
  using (private.can_access_tenant(id));

create policy "tenants_write_owner"
  on public.tenants
  for all
  to authenticated
  using (
    private.is_admin()
    or exists (
      select 1
      from public.units u
      where u.id = tenants.unit_id
        and private.can_manage_property(u.property_id)
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1
      from public.units u
      where u.id = tenants.unit_id
        and private.can_manage_property(u.property_id)
    )
  );

create policy "payments_select_scoped"
  on public.payments
  for select
  to authenticated
  using (private.can_access_tenant(tenant_id));

create policy "payments_write_owner"
  on public.payments
  for all
  to authenticated
  using (
    private.is_admin()
    or exists (
      select 1
      from public.tenants t
      join public.units u on u.id = t.unit_id
      where t.id = payments.tenant_id
        and private.can_manage_property(u.property_id)
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1
      from public.tenants t
      join public.units u on u.id = t.unit_id
      where t.id = payments.tenant_id
        and private.can_manage_property(u.property_id)
    )
  );

create policy "maintenance_select_scoped"
  on public.maintenance_requests
  for select
  to authenticated
  using (private.can_access_unit(unit_id));

create policy "maintenance_write_scoped"
  on public.maintenance_requests
  for all
  to authenticated
  using (private.can_access_unit(unit_id))
  with check (private.can_access_unit(unit_id));

create policy "property_photos_select_scoped"
  on public.property_photos
  for select
  to authenticated
  using (
    private.can_manage_property(property_id)
    or exists (
      select 1
      from public.units u
      join public.tenants t on t.unit_id = u.id
      where u.property_id = property_photos.property_id
        and lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "property_photos_write_owner"
  on public.property_photos
  for all
  to authenticated
  using (
    private.can_manage_property(property_id)
    and storage_path like ('properties/' || property_id::text || '/%')
  )
  with check (
    private.can_manage_property(property_id)
    and storage_path like ('properties/' || property_id::text || '/%')
  );

create policy "conversations_select_participant"
  on public.conversations
  for select
  to authenticated
  using (private.is_admin() or private.current_profile_id() in (landlord_profile_id, tenant_profile_id));

create policy "conversations_insert_participant"
  on public.conversations
  for insert
  to authenticated
  with check (
    private.is_admin()
    or (
      private.current_profile_id() in (landlord_profile_id, tenant_profile_id)
      and (private.current_profile_role() <> 'tenant' or private.current_profile_id() = tenant_profile_id)
    )
  );

create policy "conversations_update_participant"
  on public.conversations
  for update
  to authenticated
  using (private.is_admin() or private.current_profile_id() in (landlord_profile_id, tenant_profile_id))
  with check (private.is_admin() or private.current_profile_id() in (landlord_profile_id, tenant_profile_id));

create policy "messages_select_participant"
  on public.messages
  for select
  to authenticated
  using (
    private.is_admin()
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and private.current_profile_id() in (c.landlord_profile_id, c.tenant_profile_id)
    )
  );

create policy "messages_insert_sender_participant"
  on public.messages
  for insert
  to authenticated
  with check (
    private.is_admin()
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and messages.sender_profile_id = private.current_profile_id()
        and private.current_profile_id() in (c.landlord_profile_id, c.tenant_profile_id)
    )
  );

create policy "messages_update_participant"
  on public.messages
  for update
  to authenticated
  using (
    private.is_admin()
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and private.current_profile_id() in (c.landlord_profile_id, c.tenant_profile_id)
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and private.current_profile_id() in (c.landlord_profile_id, c.tenant_profile_id)
    )
  );

drop policy if exists "property_photos_public_read" on storage.objects;
drop policy if exists "property_photos_authenticated_insert" on storage.objects;
drop policy if exists "property_photos_authenticated_update" on storage.objects;
drop policy if exists "property_photos_authenticated_delete" on storage.objects;
drop policy if exists "profile_avatars_public_read" on storage.objects;
drop policy if exists "profile_avatars_authenticated_insert" on storage.objects;
drop policy if exists "profile_avatars_authenticated_update" on storage.objects;

create policy "property_photos_authenticated_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'property-photos'
    and private.can_manage_property(private.uuid_from_text(split_part(name, '/', 2)))
  );

create policy "property_photos_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'property-photos'
    and split_part(name, '/', 1) = 'properties'
    and private.can_manage_property(private.uuid_from_text(split_part(name, '/', 2)))
  );

create policy "property_photos_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'property-photos'
    and split_part(name, '/', 1) = 'properties'
    and private.can_manage_property(private.uuid_from_text(split_part(name, '/', 2)))
  )
  with check (
    bucket_id = 'property-photos'
    and split_part(name, '/', 1) = 'properties'
    and private.can_manage_property(private.uuid_from_text(split_part(name, '/', 2)))
  );

create policy "property_photos_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'property-photos'
    and split_part(name, '/', 1) = 'properties'
    and private.can_manage_property(private.uuid_from_text(split_part(name, '/', 2)))
  );

create policy "profile_avatars_owner_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = 'avatars'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "profile_avatars_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = 'avatars'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "profile_avatars_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = 'avatars'
    and split_part(name, '/', 2) = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = 'avatars'
    and split_part(name, '/', 2) = auth.uid()::text
  );
