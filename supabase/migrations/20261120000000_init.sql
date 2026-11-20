-- =============================================================================
-- Synseafy: initial schema
--
-- Song catalog comes from YouTube Music (via the FastAPI backend), so this
-- database only stores per-user data plus a small cache of track metadata
-- keyed by YouTube video id.
--
-- Every user-owned table is locked down with Row Level Security:
-- a signed-in user can only see and change their own rows.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on sign-up
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Fills display_name from Google ("full_name"/"name") or the register form ("display_name"),
-- falling back to the part of the email before "@".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1),
      ''
    ), 80),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- user_settings: appearance + playback preferences
-- ---------------------------------------------------------------------------

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  high_quality_audio boolean not null default true,
  autoplay_similar boolean not null default true,
  ytm_sync boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- The trigger references user_settings, so it is attached after that table exists
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- tracks: metadata cache keyed by YouTube video id (shared by all users)
-- ---------------------------------------------------------------------------

create table public.tracks (
  video_id text primary key check (char_length(video_id) between 1 and 64),
  title text not null check (char_length(title) between 1 and 300),
  artist text not null default '' check (char_length(artist) <= 300),
  album text not null default '' check (char_length(album) <= 300),
  duration_seconds integer check (duration_seconds >= 0),
  thumbnail_url text,
  genre text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tracks_set_updated_at
  before update on public.tracks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- playlists + playlist_tracks
-- ---------------------------------------------------------------------------

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  -- { "from": "#0ea5e9", "via": "#0284c7", "to": "#082f49" }
  cover_gradient jsonb not null default '{"from":"#0ea5e9","via":"#0284c7","to":"#082f49"}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index playlists_user_idx on public.playlists (user_id, created_at desc);

create trigger playlists_set_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

create table public.playlist_tracks (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  video_id text not null references public.tracks (video_id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, video_id)
);

create index playlist_tracks_order_idx on public.playlist_tracks (playlist_id, position);

-- ---------------------------------------------------------------------------
-- liked_tracks
-- ---------------------------------------------------------------------------

create table public.liked_tracks (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  video_id text not null references public.tracks (video_id) on delete cascade,
  liked_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index liked_tracks_recent_idx on public.liked_tracks (user_id, liked_at desc);

-- ---------------------------------------------------------------------------
-- play_history: source for Recently Played and the Listening Recap
-- ---------------------------------------------------------------------------

create table public.play_history (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  video_id text not null references public.tracks (video_id) on delete cascade,
  played_at timestamptz not null default now(),
  seconds_listened integer not null default 0 check (seconds_listened >= 0)
);

create index play_history_user_time_idx on public.play_history (user_id, played_at desc);

-- ---------------------------------------------------------------------------
-- recent_searches
-- ---------------------------------------------------------------------------

create table public.recent_searches (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  query text not null check (char_length(query) between 1 and 200),
  searched_at timestamptz not null default now(),
  primary key (user_id, query)
);

create index recent_searches_time_idx on public.recent_searches (user_id, searched_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.liked_tracks enable row level security;
alter table public.play_history enable row level security;
alter table public.recent_searches enable row level security;

-- profiles: read + edit your own (rows are created by the sign-up trigger)
create policy "own profile: read" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "own profile: update" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- user_settings: read + edit your own
create policy "own settings: read" on public.user_settings
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own settings: update" on public.user_settings
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- tracks: anyone may read the cache; signed-in users may add a track they interact with.
-- Updating/correcting metadata is left to the server (service role), which bypasses RLS.
create policy "tracks: public read" on public.tracks
  for select to anon, authenticated using (true);
create policy "tracks: signed-in insert" on public.tracks
  for insert to authenticated with check (true);

-- playlists: full control over your own
create policy "own playlists: all" on public.playlists
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- playlist_tracks: allowed when the parent playlist is yours
create policy "own playlist tracks: all" on public.playlist_tracks
  for all to authenticated
  using (exists (
    select 1 from public.playlists p
    where p.id = playlist_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.playlists p
    where p.id = playlist_id and p.user_id = (select auth.uid())
  ));

-- liked_tracks / play_history / recent_searches: your own rows only
create policy "own likes: all" on public.liked_tracks
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own history: read" on public.play_history
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own history: insert" on public.play_history
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own history: delete" on public.play_history
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "own searches: all" on public.recent_searches
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
