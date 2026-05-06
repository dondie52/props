-- Add app-level profiles with role support for admin, landlord, tenant.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'landlord', 'tenant')),
  created_at timestamptz not null default now()
);

alter table public.landlords
add column if not exists profile_id uuid unique references public.profiles (id) on delete set null;

-- Remove previous demo rows to keep seeded data coherent.
delete from public.maintenance_requests;
delete from public.payments;
delete from public.tenants;
delete from public.units;
delete from public.properties;
delete from public.landlords;
delete from public.profiles;

insert into public.profiles (id, full_name, email, role)
values
  ('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@propmanage.bw', 'admin'),
  ('00000000-0000-0000-0000-000000000101', 'Kabelo Molefe', 'kabelo.landlord@propmanage.bw', 'landlord'),
  ('00000000-0000-0000-0000-000000000102', 'Naledi Sechele', 'naledi.landlord@propmanage.bw', 'landlord'),
  ('00000000-0000-0000-0000-000000000201', 'Tebogo Modise', 'tebogo.tenant@propmanage.bw', 'tenant'),
  ('00000000-0000-0000-0000-000000000202', 'Neo Mooketsi', 'neo.tenant@propmanage.bw', 'tenant'),
  ('00000000-0000-0000-0000-000000000203', 'Thuso Kgosi', 'thuso.tenant@propmanage.bw', 'tenant'),
  ('00000000-0000-0000-0000-000000000204', 'Boipelo Ramokone', 'boipelo.tenant@propmanage.bw', 'tenant'),
  ('00000000-0000-0000-0000-000000000205', 'Mpho Dube', 'mpho.tenant@propmanage.bw', 'tenant'),
  ('00000000-0000-0000-0000-000000000206', 'Keneilwe Seema', 'keneilwe.tenant@propmanage.bw', 'tenant');

insert into public.landlords (id, profile_id, full_name, email)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Kabelo Molefe', 'kabelo.landlord@propmanage.bw'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000102', 'Naledi Sechele', 'naledi.landlord@propmanage.bw');

insert into public.properties (id, landlord_id, name, address, city, type)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sunset Apartments', 'Plot 103', 'Gaborone', 'Apartment'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'River View', 'Plot 42', 'Francistown', 'Complex'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Kgale Homes', 'Plot 77', 'Gaborone', 'House');

insert into public.units (id, property_id, unit_number, rent_amount, status)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'A1', 2400, 'occupied'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'A2', 2350, 'occupied'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'A3', 2200, 'vacant'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'B1', 2100, 'occupied'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'B2', 2050, 'occupied'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'B3', 2000, 'vacant'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'C1', 2600, 'occupied'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'C2', 2550, 'occupied');

insert into public.tenants (id, unit_id, full_name, email, lease_start, lease_end)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Tebogo Modise', 'tebogo.tenant@propmanage.bw', '2026-01-01', '2026-12-30'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Neo Mooketsi', 'neo.tenant@propmanage.bw', '2026-01-15', '2026-07-15'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 'Thuso Kgosi', 'thuso.tenant@propmanage.bw', '2025-10-01', '2026-04-20'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'Boipelo Ramokone', 'boipelo.tenant@propmanage.bw', '2026-02-01', '2027-01-11'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', 'Mpho Dube', 'mpho.tenant@propmanage.bw', '2026-03-01', '2026-10-02'),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000008', 'Keneilwe Seema', 'keneilwe.tenant@propmanage.bw', '2026-02-20', '2026-08-30');

insert into public.payments (id, tenant_id, amount, payment_date, due_date, status, method)
values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 2400, '2026-05-04', '2026-05-06', 'paid', 'bank transfer'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 2350, '2026-05-05', '2026-05-06', 'pending', 'bank transfer'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 2100, '2026-05-03', '2026-05-05', 'overdue', 'cash'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 2050, '2026-05-06', '2026-05-07', 'paid', 'bank transfer'),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 2600, '2026-05-02', '2026-05-03', 'pending', 'cash'),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 2550, '2026-05-11', '2026-05-12', 'paid', 'bank transfer');

insert into public.maintenance_requests (id, unit_id, category, description, urgency, status)
values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Plumbing', 'Kitchen sink leaking under cabinet', 'high', 'open'),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'Electrical', 'Breaker trips when oven is used', 'medium', 'in-progress'),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000008', 'Paint', 'Bedroom repaint after patchwork', 'low', 'resolved');
