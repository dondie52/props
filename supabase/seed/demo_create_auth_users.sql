-- Create/reset demo auth users with password: 1
-- NOTE: This writes directly to auth schema for demo environments.

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
        crypt('1', gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', v_role),
        jsonb_build_object('full_name', v_full_name, 'role', v_role),
        false,
        false,
        now(),
        now()
      );
    else
      update auth.users
      set encrypted_password = crypt('1', gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
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
      jsonb_build_object('sub', v_user_id::text, 'email', lower(v_email)),
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
set auth_user_id = u.id
from auth.users u
where lower(u.email) = lower(p.email)
  and p.auth_user_id is distinct from u.id;

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
