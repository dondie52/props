-- Ensure remote schema is demo-compatible, even on older migration states.

begin;

-- Houses table may not exist on some environments.
create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  house_number text not null,
  bedroom_count integer not null check (bedroom_count between 1 and 20),
  created_at timestamptz not null default now(),
  unique (property_id, house_number)
);

create index if not exists houses_property_id_idx on public.houses (property_id);

-- Messaging schema drift fixes.
alter table if exists public.conversations
  add column if not exists subject text not null default 'Lease support';

alter table if exists public.messages
  add column if not exists is_read boolean not null default false;

commit;

-- Link profiles to already-created auth users (if present).
update public.profiles p
set auth_user_id = u.id
from auth.users u
where lower(u.email) = lower(p.email)
  and p.auth_user_id is distinct from u.id;

-- Verify seed + schema readiness.
select jsonb_build_object(
  'profiles', (select count(*) from public.profiles),
  'landlords', (select count(*) from public.landlords),
  'properties', (select count(*) from public.properties),
  'unit_rows', (select count(*) from public.units),
  'tenants', (select count(*) from public.tenants),
  'payments', (select count(*) from public.payments),
  'maintenance_requests', (select count(*) from public.maintenance_requests),
  'conversations', (select count(*) from public.conversations),
  'messages', (select count(*) from public.messages),
  'houses', (select count(*) from public.houses)
) as ready_counts;
