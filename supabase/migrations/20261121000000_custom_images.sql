-- =============================================================================
-- Custom images: profile photos and playlist covers
--
-- Files live in two public Storage buckets. Anyone can view an image by its
-- URL (they are shown in the app), but a user can only upload, replace or
-- delete files inside their own folder: <bucket>/<their user id>/...
-- =============================================================================

-- Playlist cover image (null = use the generated gradient cover)
alter table public.playlists
  add column if not exists cover_url text check (cover_url is null or char_length(cover_url) <= 1000);

-- profiles.avatar_url already exists (filled from Google on sign-up)

-- ---------------------------------------------------------------------------
-- Buckets: images only, 2 MB max (the app uploads ~512px WebP, far smaller)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']),
  ('playlist-covers', 'playlist-covers', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Policies: each user manages only <bucket>/<own user id>/...
-- (Public buckets serve files by URL without a select policy; the select
--  policy below lets users list/replace their own files.)
-- ---------------------------------------------------------------------------

-- Safe to run more than once
drop policy if exists "own images: read" on storage.objects;
drop policy if exists "own images: upload" on storage.objects;
drop policy if exists "own images: replace" on storage.objects;
drop policy if exists "own images: delete" on storage.objects;

create policy "own images: read" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('avatars', 'playlist-covers')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own images: upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars', 'playlist-covers')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own images: replace" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'playlist-covers')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('avatars', 'playlist-covers')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own images: delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars', 'playlist-covers')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
