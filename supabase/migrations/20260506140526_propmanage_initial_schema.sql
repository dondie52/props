-- PropManage BW initial schema (cursor.md §5)

create table public.landlords (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id),
  name text not null,
  address text not null,
  city text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create index properties_landlord_id_idx on public.properties (landlord_id);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id),
  unit_number text not null,
  rent_amount numeric not null,
  status text not null default 'vacant'
);

create index units_property_id_idx on public.units (property_id);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id),
  full_name text not null,
  email text not null,
  lease_start date not null,
  lease_end date not null
);

create index tenants_unit_id_idx on public.tenants (unit_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id),
  amount numeric not null,
  payment_date date not null,
  due_date date not null,
  status text not null,
  method text not null
);

create index payments_tenant_id_idx on public.payments (tenant_id);

create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id),
  category text not null,
  description text not null,
  urgency text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index maintenance_requests_unit_id_idx on public.maintenance_requests (unit_id);
