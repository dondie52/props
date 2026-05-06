-- Onboarding progress + property photos + performance indexes

alter table public.profiles
add column if not exists onboarding_state jsonb;

create table if not exists public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists property_photos_property_id_idx on public.property_photos (property_id);
create unique index if not exists property_photos_one_primary_per_property
  on public.property_photos (property_id)
  where is_primary;

-- Common join/filter indexes
create index if not exists units_property_id_idx on public.units (property_id);
create index if not exists tenants_unit_id_idx on public.tenants (unit_id);
create index if not exists payments_tenant_id_idx on public.payments (tenant_id);
create index if not exists maintenance_requests_unit_id_idx on public.maintenance_requests (unit_id);

