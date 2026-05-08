-- Let tenants read the landlord row attached to their leased unit so messaging can find the landlord profile.

drop policy if exists "landlords_select_scoped" on public.landlords;

create policy "landlords_select_scoped"
  on public.landlords
  for select
  to authenticated
  using (
    private.is_admin()
    or profile_id = private.current_profile_id()
    or exists (
      select 1
      from public.properties p
      join public.units u on u.property_id = p.id
      join public.tenants t on t.unit_id = u.id
      where p.landlord_id = landlords.id
        and lower(t.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
