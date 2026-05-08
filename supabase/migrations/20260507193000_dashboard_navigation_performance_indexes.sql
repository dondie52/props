-- Speed up auth/profile lookup and dashboard tab queries.

create index if not exists profiles_auth_user_id_idx
  on public.profiles (auth_user_id);

create index if not exists profiles_lower_email_unlinked_idx
  on public.profiles (lower(email))
  where auth_user_id is null;

create index if not exists landlords_profile_id_idx
  on public.landlords (profile_id);

create index if not exists payments_tenant_due_date_idx
  on public.payments (tenant_id, due_date desc);

create index if not exists payments_tenant_payment_date_idx
  on public.payments (tenant_id, payment_date desc);

create index if not exists maintenance_requests_unit_created_at_idx
  on public.maintenance_requests (unit_id, created_at desc);

create index if not exists tenants_unit_lease_end_idx
  on public.tenants (unit_id, lease_end);
