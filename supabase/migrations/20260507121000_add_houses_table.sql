-- Add multi-residence support with house-level records per property.

create table public.houses (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  house_number text not null,
  bedroom_count integer not null check (bedroom_count between 1 and 20),
  created_at timestamptz not null default now(),
  unique (property_id, house_number)
);

create index houses_property_id_idx on public.houses (property_id);

revoke all privileges on table public.houses from anon;
grant select, insert, update, delete on table public.houses to authenticated;

alter table public.houses enable row level security;

create policy "houses_select_scoped"
  on public.houses
  for select
  to authenticated
  using (private.can_manage_property(property_id));

create policy "houses_write_owner"
  on public.houses
  for all
  to authenticated
  using (private.can_manage_property(property_id))
  with check (private.can_manage_property(property_id));
