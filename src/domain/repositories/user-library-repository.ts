import { Playlist } from "@/src/domain/entities/playlist";
import { Track } from "@/src/domain/entities/track";

export type ThemeMode = "dark" | "light";

export interface UserSettings {
  theme: ThemeMode;
  highQualityAudio: boolean;
  autoplaySimilar: boolean;
  ytmSync: boolean;
}

export interface PlayRecord {
  id: string;
  trackId: string;
  playedAt: string; // ISO string
  durationListened: number; // seconds
}

/** Everything that belongs to one signed-in user, loaded in one go after sign-in. */
export interface UserLibrarySnapshot {
  playlists: Playlist[];
  likedTrackIds: string[];
  history: PlayRecord[];
  recentSearches: string[];
  settings: UserSettings;
}

/**
 * Per-user data (likes, playlists, listening history, searches, settings).
 * All methods act on the currently signed-in user; ownership is enforced by the
 * database (Row Level Security), so ids passed in can't reach another user's rows.
 */
export interface IUserLibraryRepository {
  load(userId: string): Promise<UserLibrarySnapshot>;

  like(track: Track): Promise<void>;
  unlike(track: Track): Promise<void>;

  createPlaylist(playlist: Playlist): Promise<void>;
  updatePlaylist(id: string, name: string, description: string): Promise<void>;
  deletePlaylist(id: string): Promise<void>;
  /** Replace the playlist's track list (order included) with `tracks`. */
  setPlaylistTracks(playlistId: string, tracks: Track[]): Promise<void>;

  /** `playedAt` (ISO) defaults to now; set it when saving a play that happened earlier. */
  logPlay(track: Track, secondsListened: number, playedAt?: string): Promise<void>;
  clearHistory(): Promise<void>;

  addRecentSearch(query: string): Promise<void>;
  removeRecentSearch(query: string): Promise<void>;
  clearRecentSearches(): Promise<void>;

  updateSettings(patch: Partial<UserSettings>): Promise<void>;
}
