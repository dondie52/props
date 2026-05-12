-- Profile photo storage path on profiles + ensure bucket exists for local/prod

alter table public.profiles
add column if not exists avatar_path text;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', false)
on conflict (id) do nothing;

drop policy if exists "profile_avatars_owner_delete" on storage.objects;

create policy "profile_avatars_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = 'avatars'
    and split_part(name, '/', 2) = auth.uid()::text
  );
