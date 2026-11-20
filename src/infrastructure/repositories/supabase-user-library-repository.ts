import { Playlist } from "@/src/domain/entities/playlist";
import { Track } from "@/src/domain/entities/track";
import {
  IUserLibraryRepository,
  PlayRecord,
  UserLibrarySnapshot,
  UserSettings,
} from "@/src/domain/repositories/user-library-repository";
import { findTrackByVideoId } from "@/src/infrastructure/data/catalog";
import { getSupabase } from "@/src/infrastructure/supabase/client";

const HISTORY_LIMIT = 500;
const RECENT_SEARCH_LIMIT = 6;

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  highQualityAudio: true,
  autoplaySimilar: true,
  ytmSync: false,
};

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

/** Map catalog ids back from stored video ids, dropping songs the catalog doesn't know. */
function toTrackId(videoId: string): string | undefined {
  return findTrackByVideoId(videoId)?.id;
}

/** PostgREST `in` list with each value quoted, e.g. ("a","b"). */
function inList(values: string[]): string {
  return `(${values.map((v) => `"${v.replace(/"/g, '\\"')}"`).join(",")})`;
}

/**
 * Cache rows for songs before referencing them (likes, playlists, history all
 * have a foreign key to tracks). Existing rows are left untouched.
 */
async function ensureTracks(tracks: Track[]): Promise<void> {
  if (tracks.length === 0) return;
  const rows = tracks.map((t) => ({
    video_id: t.videoId,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration_seconds: t.duration,
    genre: t.genre,
  }));
  const { error } = await getSupabase()
    .from("tracks")
    .upsert(rows, { onConflict: "video_id", ignoreDuplicates: true });
  fail("Saving track", error);
}

export class SupabaseUserLibraryRepository implements IUserLibraryRepository {
  async load(userId: string): Promise<UserLibrarySnapshot> {
    const db = getSupabase();

    const [playlistsRes, likesRes, historyRes, searchesRes, settingsRes] =
      await Promise.all([
        db
          .from("playlists")
          .select("id, name, description, cover_gradient, created_at, playlist_tracks(video_id, position)")
          .order("created_at", { ascending: false })
          .order("position", { referencedTable: "playlist_tracks", ascending: true }),
        db
          .from("liked_tracks")
          .select("video_id")
          .order("liked_at", { ascending: false }),
        db
          .from("play_history")
          .select("id, video_id, played_at, seconds_listened")
          .order("played_at", { ascending: false })
          .limit(HISTORY_LIMIT),
        db
          .from("recent_searches")
          .select("query")
          .order("searched_at", { ascending: false })
          .limit(RECENT_SEARCH_LIMIT),
        db
          .from("user_settings")
          .select("theme, high_quality_audio, autoplay_similar, ytm_sync")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    fail("Loading playlists", playlistsRes.error);
    fail("Loading likes", likesRes.error);
    fail("Loading history", historyRes.error);
    fail("Loading searches", searchesRes.error);
    fail("Loading settings", settingsRes.error);

    const playlists: Playlist[] = (playlistsRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      coverGradient: row.cover_gradient,
      trackIds: (row.playlist_tracks ?? [])
        .map((pt: { video_id: string }) => toTrackId(pt.video_id))
        .filter((id: string | undefined): id is string => Boolean(id)),
      createdAt: String(row.created_at).slice(0, 10),
    }));

    const likedTrackIds = (likesRes.data ?? [])
      .map((row) => toTrackId(row.video_id))
      .filter((id): id is string => Boolean(id));

    const history: PlayRecord[] = (historyRes.data ?? []).flatMap((row) => {
      const trackId = toTrackId(row.video_id);
      return trackId
        ? [
            {
              id: String(row.id),
              trackId,
              playedAt: row.played_at,
              durationListened: row.seconds_listened,
            },
          ]
        : [];
    });

    const s = settingsRes.data;
    const settings: UserSettings = s
      ? {
          theme: s.theme === "light" ? "light" : "dark",
          highQualityAudio: s.high_quality_audio,
          autoplaySimilar: s.autoplay_similar,
          ytmSync: s.ytm_sync,
        }
      : DEFAULT_SETTINGS;

    return {
      playlists,
      likedTrackIds,
      history,
      recentSearches: (searchesRes.data ?? []).map((row) => row.query),
      settings,
    };
  }

  async like(track: Track): Promise<void> {
    await ensureTracks([track]);
    const { error } = await getSupabase()
      .from("liked_tracks")
      .upsert({ video_id: track.videoId }, { onConflict: "user_id,video_id", ignoreDuplicates: true });
    fail("Liking song", error);
  }

  async unlike(track: Track): Promise<void> {
    const { error } = await getSupabase()
      .from("liked_tracks")
      .delete()
      .eq("video_id", track.videoId);
    fail("Unliking song", error);
  }

  async createPlaylist(playlist: Playlist): Promise<void> {
    const { error } = await getSupabase().from("playlists").insert({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      cover_gradient: playlist.coverGradient,
    });
    fail("Creating playlist", error);
  }

  async updatePlaylist(id: string, name: string, description: string): Promise<void> {
    const { error } = await getSupabase()
      .from("playlists")
      .update({ name, description })
      .eq("id", id);
    fail("Updating playlist", error);
  }

  async deletePlaylist(id: string): Promise<void> {
    const { error } = await getSupabase().from("playlists").delete().eq("id", id);
    fail("Deleting playlist", error);
  }

  async setPlaylistTracks(playlistId: string, tracks: Track[]): Promise<void> {
    const db = getSupabase();
    await ensureTracks(tracks);

    // Write the new order first, then drop rows that are no longer in the list,
    // so a failure part-way never loses songs that should stay.
    if (tracks.length > 0) {
      const { error } = await db.from("playlist_tracks").upsert(
        tracks.map((t, position) => ({
          playlist_id: playlistId,
          video_id: t.videoId,
          position,
        })),
        { onConflict: "playlist_id,video_id" }
      );
      fail("Saving playlist songs", error);
    }

    let removal = db.from("playlist_tracks").delete().eq("playlist_id", playlistId);
    if (tracks.length > 0) {
      removal = removal.not("video_id", "in", inList(tracks.map((t) => t.videoId)));
    }
    const { error } = await removal;
    fail("Removing playlist songs", error);
  }

  async logPlay(track: Track, secondsListened: number, playedAt?: string): Promise<void> {
    await ensureTracks([track]);
    const { error } = await getSupabase().from("play_history").insert({
      video_id: track.videoId,
      seconds_listened: Math.max(0, Math.round(secondsListened)),
      ...(playedAt ? { played_at: playedAt } : {}),
    });
    fail("Saving play", error);
  }

  async clearHistory(): Promise<void> {
    // RLS limits this to the signed-in user's rows; the filter just satisfies
    // PostgREST's rule that deletes must have a WHERE clause.
    const { error } = await getSupabase().from("play_history").delete().gte("id", 0);
    fail("Clearing history", error);
  }

  async addRecentSearch(query: string): Promise<void> {
    const { error } = await getSupabase()
      .from("recent_searches")
      .upsert({ query, searched_at: new Date().toISOString() }, { onConflict: "user_id,query" });
    fail("Saving search", error);
  }

  async removeRecentSearch(query: string): Promise<void> {
    const { error } = await getSupabase()
      .from("recent_searches")
      .delete()
      .eq("query", query);
    fail("Removing search", error);
  }

  async clearRecentSearches(): Promise<void> {
    const { error } = await getSupabase()
      .from("recent_searches")
      .delete()
      .neq("query", "");
    fail("Clearing searches", error);
  }

  async updateSettings(patch: Partial<UserSettings>): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.theme !== undefined) row.theme = patch.theme;
    if (patch.highQualityAudio !== undefined) row.high_quality_audio = patch.highQualityAudio;
    if (patch.autoplaySimilar !== undefined) row.autoplay_similar = patch.autoplaySimilar;
    if (patch.ytmSync !== undefined) row.ytm_sync = patch.ytmSync;
    if (Object.keys(row).length === 0) return;

    const db = getSupabase();
    // getSession reads the locally stored session (no network round-trip)
    const userId = (await db.auth.getSession()).data.session?.user.id;
    if (!userId) throw new Error("Saving settings: not signed in");

    const { error } = await db.from("user_settings").update(row).eq("user_id", userId);
    fail("Saving settings", error);
  }
}

export const userLibraryRepository = new SupabaseUserLibraryRepository();
