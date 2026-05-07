-- Allow dashboard queries to read seeded public data.
grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant select on table public.landlords to anon, authenticated;
grant select on table public.properties to anon, authenticated;
grant select on table public.units to anon, authenticated;
grant select on table public.tenants to anon, authenticated;
grant select on table public.payments to anon, authenticated;
grant select on table public.maintenance_requests to anon, authenticated;
