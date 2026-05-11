-- Demo seed for 3 use cases: Admin oversight, Landlord operations, Tenant self-service.
-- Safe to run multiple times in Supabase SQL editor.

begin;

-- Clear dependent tables first (FK-safe order).
delete from public.messages;
delete from public.conversations;
delete from public.maintenance_requests;
delete from public.payments;
delete from public.tenants;
do $$
begin
  if to_regclass('public.houses') is not null then
    execute 'delete from public.houses';
  end if;
end $$;
delete from public.units;
delete from public.property_photos;
delete from public.properties;
delete from public.landlords;
delete from public.profiles;

-- Profiles (roles used by the app's dashboard routing and RLS helpers).
insert into public.profiles (id, full_name, email, role, onboarding_state)
values
  ('70000000-0000-0000-0000-000000000001', 'Platform Admin', 'admin.demo@propmanage.bw', 'admin', null),
  ('70000000-0000-0000-0000-000000000101', 'Kabelo Molefe', 'landlord.one@propmanage.bw', 'landlord', '{"step":"completed","lastCompletedStep":"review"}'::jsonb),
  ('70000000-0000-0000-0000-000000000102', 'Naledi Sechele', 'landlord.two@propmanage.bw', 'landlord', '{"step":"completed","lastCompletedStep":"review"}'::jsonb),
  ('70000000-0000-0000-0000-000000000201', 'Tebogo Modise', 'tenant.one@propmanage.bw', 'tenant', null),
  ('70000000-0000-0000-0000-000000000202', 'Neo Mooketsi', 'tenant.two@propmanage.bw', 'tenant', null),
  ('70000000-0000-0000-0000-000000000203', 'Mpho Dube', 'tenant.three@propmanage.bw', 'tenant', null),
  ('70000000-0000-0000-0000-000000000204', 'Boipelo Ramokone', 'tenant.four@propmanage.bw', 'tenant', null);

insert into public.landlords (id, profile_id, full_name, email)
values
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000101', 'Kabelo Molefe', 'landlord.one@propmanage.bw'),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000102', 'Naledi Sechele', 'landlord.two@propmanage.bw');

insert into public.properties (id, landlord_id, name, address, city, type)
values
  ('72000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 'Sunset Court', 'Plot 103, Block 7', 'Gaborone', 'Apartment'),
  ('72000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 'River View Residences', 'Plot 42, Phase 2', 'Francistown', 'Complex'),
  ('72000000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000002', 'Kgale Family Homes', 'Plot 77, Kgale', 'Gaborone', 'House');

do $$
begin
  if to_regclass('public.houses') is not null then
    insert into public.houses (id, property_id, house_number, bedroom_count)
    values
      ('72500000-0000-0000-0000-000000000001', '72000000-0000-0000-0000-000000000003', 'H1', 3),
      ('72500000-0000-0000-0000-000000000002', '72000000-0000-0000-0000-000000000003', 'H2', 2);
  end if;
end $$;

insert into public.units (id, property_id, unit_number, rent_amount, status)
values
  ('73000000-0000-0000-0000-000000000001', '72000000-0000-0000-0000-000000000001', 'A1', 3500, 'occupied'),
  ('73000000-0000-0000-0000-000000000002', '72000000-0000-0000-0000-000000000001', 'A2', 3300, 'occupied'),
  ('73000000-0000-0000-0000-000000000003', '72000000-0000-0000-0000-000000000001', 'A3', 3200, 'vacant'),
  ('73000000-0000-0000-0000-000000000004', '72000000-0000-0000-0000-000000000002', 'B1', 2800, 'occupied'),
  ('73000000-0000-0000-0000-000000000005', '72000000-0000-0000-0000-000000000002', 'B2', 2700, 'vacant'),
  ('73000000-0000-0000-0000-000000000006', '72000000-0000-0000-0000-000000000003', 'H1', 4200, 'occupied'),
  ('73000000-0000-0000-0000-000000000007', '72000000-0000-0000-0000-000000000003', 'H2', 3900, 'occupied');

insert into public.tenants (id, unit_id, full_name, email, lease_start, lease_end)
values
  ('74000000-0000-0000-0000-000000000001', '73000000-0000-0000-0000-000000000001', 'Tebogo Modise', 'tenant.one@propmanage.bw', date '2026-01-01', date '2026-12-31'),
  ('74000000-0000-0000-0000-000000000002', '73000000-0000-0000-0000-000000000002', 'Neo Mooketsi', 'tenant.two@propmanage.bw', date '2026-03-01', date '2027-02-28'),
  ('74000000-0000-0000-0000-000000000003', '73000000-0000-0000-0000-000000000004', 'Mpho Dube', 'tenant.three@propmanage.bw', date '2025-09-01', date '2026-08-31'),
  ('74000000-0000-0000-0000-000000000004', '73000000-0000-0000-0000-000000000007', 'Boipelo Ramokone', 'tenant.four@propmanage.bw', date '2026-02-15', date '2027-02-14');

-- Payment mix intentionally includes paid, pending, and overdue.
insert into public.payments (id, tenant_id, amount, payment_date, due_date, status, method)
values
  ('75000000-0000-0000-0000-000000000001', '74000000-0000-0000-0000-000000000001', 3500, date '2026-05-03', date '2026-05-01', 'paid', 'bank transfer'),
  ('75000000-0000-0000-0000-000000000002', '74000000-0000-0000-0000-000000000001', 3500, date '2026-06-01', date '2026-06-01', 'pending', 'system'),
  ('75000000-0000-0000-0000-000000000003', '74000000-0000-0000-0000-000000000002', 3300, date '2026-04-30', date '2026-05-01', 'paid', 'cash'),
  ('75000000-0000-0000-0000-000000000004', '74000000-0000-0000-0000-000000000002', 3300, date '2026-06-01', date '2026-06-01', 'pending', 'system'),
  ('75000000-0000-0000-0000-000000000005', '74000000-0000-0000-0000-000000000003', 2800, date '2026-04-20', date '2026-05-01', 'overdue', 'bank transfer'),
  ('75000000-0000-0000-0000-000000000006', '74000000-0000-0000-0000-000000000004', 3900, date '2026-05-02', date '2026-05-01', 'paid', 'bank transfer');

insert into public.maintenance_requests (id, unit_id, category, description, urgency, status, created_at)
values
  ('76000000-0000-0000-0000-000000000001', '73000000-0000-0000-0000-000000000001', 'Plumbing', 'Kitchen sink leaking under cabinet.', 'high', 'open', now() - interval '4 days'),
  ('76000000-0000-0000-0000-000000000002', '73000000-0000-0000-0000-000000000004', 'Electrical', 'Breaker trips when electric stove is used.', 'medium', 'in-progress', now() - interval '2 days'),
  ('76000000-0000-0000-0000-000000000003', '73000000-0000-0000-0000-000000000007', 'Paint', 'Bedroom wall repaint after moisture repair.', 'low', 'resolved', now() - interval '10 days');

insert into public.property_photos (id, property_id, storage_path, is_primary)
values
  ('77000000-0000-0000-0000-000000000001', '72000000-0000-0000-0000-000000000001', 'properties/72000000-0000-0000-0000-000000000001/front-elevation.jpg', true),
  ('77000000-0000-0000-0000-000000000002', '72000000-0000-0000-0000-000000000002', 'properties/72000000-0000-0000-0000-000000000002/entry-view.jpg', true),
  ('77000000-0000-0000-0000-000000000003', '72000000-0000-0000-0000-000000000003', 'properties/72000000-0000-0000-0000-000000000003/garden.jpg', true);

-- Tenant-landlord conversation threads for dashboard chat.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'conversations'
      and column_name = 'subject'
  ) then
    insert into public.conversations (id, landlord_profile_id, tenant_profile_id, tenant_id, unit_id, subject, last_message_at, created_at)
    values
      ('78000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000101', '70000000-0000-0000-0000-000000000201', '74000000-0000-0000-0000-000000000001', '73000000-0000-0000-0000-000000000001', 'Water pressure in bathroom', now() - interval '1 day', now() - interval '5 days'),
      ('78000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000101', '70000000-0000-0000-0000-000000000202', '74000000-0000-0000-0000-000000000002', '73000000-0000-0000-0000-000000000002', 'Parking bay assignment', now() - interval '3 hours', now() - interval '3 days'),
      ('78000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000102', '70000000-0000-0000-0000-000000000204', '74000000-0000-0000-0000-000000000004', '73000000-0000-0000-0000-000000000007', 'Lease renewal discussion', now() - interval '12 hours', now() - interval '7 days');
  else
    insert into public.conversations (id, landlord_profile_id, tenant_profile_id, tenant_id, unit_id, last_message_at, created_at)
    values
      ('78000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000101', '70000000-0000-0000-0000-000000000201', '74000000-0000-0000-0000-000000000001', '73000000-0000-0000-0000-000000000001', now() - interval '1 day', now() - interval '5 days'),
      ('78000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000101', '70000000-0000-0000-0000-000000000202', '74000000-0000-0000-0000-000000000002', '73000000-0000-0000-0000-000000000002', now() - interval '3 hours', now() - interval '3 days'),
      ('78000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000102', '70000000-0000-0000-0000-000000000204', '74000000-0000-0000-0000-000000000004', '73000000-0000-0000-0000-000000000007', now() - interval '12 hours', now() - interval '7 days');
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'is_read'
  ) then
    insert into public.messages (id, conversation_id, sender_profile_id, body, is_read, created_at)
    values
      ('79000000-0000-0000-0000-000000000001', '78000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000201', 'Good morning, the shower pressure dropped since yesterday.', true, now() - interval '2 days'),
      ('79000000-0000-0000-0000-000000000002', '78000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000101', 'Thanks, plumber is scheduled for tomorrow morning.', false, now() - interval '1 day'),
      ('79000000-0000-0000-0000-000000000003', '78000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000101', 'You have been assigned bay P-12 near Block A entrance.', false, now() - interval '3 hours'),
      ('79000000-0000-0000-0000-000000000004', '78000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000204', 'Can I renew for another 12 months at current terms?', true, now() - interval '15 hours'),
      ('79000000-0000-0000-0000-000000000005', '78000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000102', 'Yes, I will share the renewal document this week.', false, now() - interval '12 hours');
  else
    insert into public.messages (id, conversation_id, sender_profile_id, body, created_at)
    values
      ('79000000-0000-0000-0000-000000000001', '78000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000201', 'Good morning, the shower pressure dropped since yesterday.', now() - interval '2 days'),
      ('79000000-0000-0000-0000-000000000002', '78000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000101', 'Thanks, plumber is scheduled for tomorrow morning.', now() - interval '1 day'),
      ('79000000-0000-0000-0000-000000000003', '78000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000101', 'You have been assigned bay P-12 near Block A entrance.', now() - interval '3 hours'),
      ('79000000-0000-0000-0000-000000000004', '78000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000204', 'Can I renew for another 12 months at current terms?', now() - interval '15 hours'),
      ('79000000-0000-0000-0000-000000000005', '78000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000102', 'Yes, I will share the renewal document this week.', now() - interval '12 hours');
  end if;
end $$;

commit;

-- Optional helper: run after creating demo Auth users in Supabase Auth dashboard.
-- This links auth.users -> profiles by email (required for role-based routing).
update public.profiles p
set auth_user_id = u.id
from auth.users u
where lower(u.email) = lower(p.email)
  and p.auth_user_id is distinct from u.id;

-- Quick sanity check counts.
select jsonb_build_object(
  'profiles', (select count(*) from public.profiles),
  'landlords', (select count(*) from public.landlords),
  'properties', (select count(*) from public.properties),
  'unit_rows', (select count(*) from public.units),
  'tenants', (select count(*) from public.tenants),
  'payments', (select count(*) from public.payments),
  'maintenance_requests', (select count(*) from public.maintenance_requests),
  'conversations', (select count(*) from public.conversations),
  'messages', (select count(*) from public.messages)
) as seed_counts;
