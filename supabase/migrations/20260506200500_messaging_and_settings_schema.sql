-- Messaging and settings persistence schema.

alter table public.profiles
add column if not exists phone text,
add column if not exists company text,
add column if not exists country text default 'Botswana',
add column if not exists avatar_path text,
add column if not exists two_factor_enabled boolean not null default false,
add column if not exists notification_email_enabled boolean not null default true,
add column if not exists notification_in_app_enabled boolean not null default true,
add column if not exists billing_plan text not null default 'pro',
add column if not exists billing_status text not null default 'active',
add column if not exists payment_last4 text;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  landlord_profile_id uuid not null references public.profiles (id) on delete cascade,
  tenant_profile_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  unit_id uuid references public.units (id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (landlord_profile_id, tenant_profile_id, tenant_id)
);

create index if not exists conversations_landlord_profile_id_idx on public.conversations (landlord_profile_id);
create index if not exists conversations_tenant_profile_id_idx on public.conversations (tenant_profile_id);
create index if not exists conversations_last_message_at_idx on public.conversations (last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at desc);
create index if not exists messages_sender_profile_id_idx on public.messages (sender_profile_id);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

grant select, insert, update on table public.conversations to authenticated;
grant select, insert, update on table public.messages to authenticated;
grant select on table public.conversations to anon;
grant select on table public.messages to anon;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id in (landlord_profile_id, tenant_profile_id)
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant"
  on public.conversations
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id in (landlord_profile_id, tenant_profile_id)
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id in (landlord_profile_id, tenant_profile_id)
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id in (landlord_profile_id, tenant_profile_id)
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      join public.profiles p on p.id in (c.landlord_profile_id, c.tenant_profile_id)
      where c.id = conversation_id
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "messages_insert_sender_participant" on public.messages;
create policy "messages_insert_sender_participant"
  on public.messages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.conversations c
      join public.profiles sender on sender.id = sender_profile_id
      join public.profiles participant on participant.id in (c.landlord_profile_id, c.tenant_profile_id)
      where c.id = conversation_id
        and sender.id in (c.landlord_profile_id, c.tenant_profile_id)
        and lower(sender.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and lower(participant.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant"
  on public.messages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      join public.profiles p on p.id in (c.landlord_profile_id, c.tenant_profile_id)
      where c.id = conversation_id
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    exists (
      select 1
      from public.conversations c
      join public.profiles p on p.id in (c.landlord_profile_id, c.tenant_profile_id)
      where c.id = conversation_id
        and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_avatars_public_read" on storage.objects;
create policy "profile_avatars_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'profile-avatars');

drop policy if exists "profile_avatars_authenticated_insert" on storage.objects;
create policy "profile_avatars_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'profile-avatars');

drop policy if exists "profile_avatars_authenticated_update" on storage.objects;
create policy "profile_avatars_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'profile-avatars')
  with check (bucket_id = 'profile-avatars');
