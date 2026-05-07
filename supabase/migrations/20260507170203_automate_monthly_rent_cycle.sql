-- Automate monthly rent obligations and overdue status updates.

create extension if not exists pg_cron with schema extensions;

create unique index if not exists payments_system_rent_due_once_idx
  on public.payments (tenant_id, due_date)
  where method = 'system';

create or replace function private.run_monthly_rent_cycle(run_date date default current_date)
returns table(created_count integer, overdue_count integer)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  month_start date := date_trunc('month', run_date)::date;
  month_end date := (date_trunc('month', run_date) + interval '1 month - 1 day')::date;
begin
  insert into public.payments (tenant_id, amount, payment_date, due_date, status, method)
  select
    t.id,
    u.rent_amount,
    month_start,
    month_start,
    'pending',
    'system'
  from public.tenants t
  join public.units u on u.id = t.unit_id
  where t.lease_start <= month_end
    and t.lease_end >= month_start
    and u.status = 'occupied'
    and u.rent_amount > 0
  on conflict (tenant_id, due_date) where method = 'system' do nothing;

  get diagnostics created_count = row_count;

  update public.payments
  set status = 'overdue'
  where status = 'pending'
    and due_date < run_date;

  get diagnostics overdue_count = row_count;

  return next;
end;
$$;

revoke all on function private.run_monthly_rent_cycle(date) from public;
grant execute on function private.run_monthly_rent_cycle(date) to postgres, service_role;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'propmanage-monthly-rent-cycle'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'propmanage-monthly-rent-cycle',
  '15 2 * * *',
  $$select * from private.run_monthly_rent_cycle(current_date);$$
);
