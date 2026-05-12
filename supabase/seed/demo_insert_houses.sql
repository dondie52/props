insert into public.houses (id, property_id, house_number, bedroom_count)
values
  ('72500000-0000-0000-0000-000000000001', '72000000-0000-0000-0000-000000000003', 'H1', 3),
  ('72500000-0000-0000-0000-000000000002', '72000000-0000-0000-0000-000000000003', 'H2', 2)
on conflict (property_id, house_number) do update
set bedroom_count = excluded.bedroom_count;

select jsonb_build_object(
  'houses', (select count(*) from public.houses),
  'kgale_houses', (
    select count(*)
    from public.houses
    where property_id = '72000000-0000-0000-0000-000000000003'
  )
) as house_counts;
