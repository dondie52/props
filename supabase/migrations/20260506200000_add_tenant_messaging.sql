-- Add tenant-landlord messaging tables before auth-scoped RLS policies are applied.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  landlord_profile_id uuid not null references public.profiles (id) on delete cascade,
  tenant_profile_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  subject text not null default 'Lease support',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint conversations_distinct_participants check (landlord_profile_id <> tenant_profile_id),
  constraint conversations_tenant_unit_unique unique (tenant_id, unit_id)
);

create index if not exists conversations_landlord_profile_id_idx
  on public.conversations (landlord_profile_id, last_message_at desc);

create index if not exists conversations_tenant_profile_id_idx
  on public.conversations (tenant_profile_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_sender_profile_id_idx
  on public.messages (sender_profile_id);
