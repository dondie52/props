-- Create/reset demo auth users with password: demo123
-- NOTE: This writes directly to auth schema for demo environments.
-- Password must be at least 6 characters (Supabase Auth policy).
-- Emails like *@propmanage.bw are rejected by Auth signup validation,
-- so demo users must be inserted here (not via /auth/signup).
-- Token columns must be '' (not NULL) or GoTrue returns
-- "Database error querying schema" on password login.

do $$
declare
  v_instance_id uuid := coalesce((select instance_id from auth.users limit 1), '00000000-0000-0000-0000-000000000000'::uuid);
  v_user_id uuid;
  v_email text;
  v_full_name text;
  v_role text;
begin
  for v_email, v_full_name, v_role in
    select *
    from (
      values
        ('admin.demo@propmanage.bw', 'Platform Admin', 'admin'),
        ('landlord.one@propmanage.bw', 'Kabelo Molefe', 'landlord'),
        ('landlord.two@propmanage.bw', 'Naledi Sechele', 'landlord'),
        ('tenant.one@propmanage.bw', 'Tebogo Modise', 'tenant'),
        ('tenant.two@propmanage.bw', 'Neo Mooketsi', 'tenant'),
        ('tenant.three@propmanage.bw', 'Mpho Dube', 'tenant'),
        ('tenant.four@propmanage.bw', 'Boipelo Ramokone', 'tenant')
    ) as t(email, full_name, role)
  loop
    select id into v_user_id
    from auth.users
    where lower(email) = lower(v_email)
    limit 1;

    if v_user_id is null then
      v_user_id := gen_random_uuid();

      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        email_change_token_current,
        phone_change,
        phone_change_token,
        reauthentication_token,
        raw_app_meta_data,
        raw_user_meta_data,
        is_sso_user,
        is_anonymous,
        created_at,
        updated_at
      )
      values (
        v_instance_id,
        v_user_id,
        'authenticated',
        'authenticated',
        lower(v_email),
        crypt('demo123', gen_salt('bf')),
        now(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', v_role),
        jsonb_build_object('full_name', v_full_name, 'role', v_role),
        false,
        false,
        now(),
        now()
      );
    else
      update auth.users
      set encrypted_password = crypt('demo123', gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          confirmation_token = coalesce(confirmation_token, ''),
          recovery_token = coalesce(recovery_token, ''),
          email_change_token_new = coalesce(email_change_token_new, ''),
          email_change = coalesce(email_change, ''),
          email_change_token_current = coalesce(email_change_token_current, ''),
          phone_change = coalesce(phone_change, ''),
          phone_change_token = coalesce(phone_change_token, ''),
          reauthentication_token = coalesce(reauthentication_token, ''),
          raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', v_role),
          raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', v_full_name, 'role', v_role),
          updated_at = now()
      where id = v_user_id;
    end if;

    insert into auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      v_user_id::text,
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', lower(v_email),
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id)
    do update
      set user_id = excluded.user_id,
          identity_data = excluded.identity_data,
          updated_at = now();
  end loop;
end $$;

update public.profiles p
set auth_user_id = u.id,
    role = case
      when lower(p.email) = 'admin.demo@propmanage.bw' then 'admin'
      else p.role
    end
from auth.users u
where lower(u.email) = lower(p.email)
  and (
    p.auth_user_id is distinct from u.id
    or (lower(p.email) = 'admin.demo@propmanage.bw' and p.role is distinct from 'admin')
  );

select jsonb_build_object(
  'auth_users', (
    select count(*)
    from auth.users
    where lower(email) in (
      'admin.demo@propmanage.bw',
      'landlord.one@propmanage.bw',
      'landlord.two@propmanage.bw',
      'tenant.one@propmanage.bw',
      'tenant.two@propmanage.bw',
      'tenant.three@propmanage.bw',
      'tenant.four@propmanage.bw'
    )
  ),
  'linked_profiles', (
    select count(*)
    from public.profiles
    where lower(email) in (
      'admin.demo@propmanage.bw',
      'landlord.one@propmanage.bw',
      'landlord.two@propmanage.bw',
      'tenant.one@propmanage.bw',
      'tenant.two@propmanage.bw',
      'tenant.three@propmanage.bw',
      'tenant.four@propmanage.bw'
    )
    and auth_user_id is not null
  )
) as auth_seed_status;
