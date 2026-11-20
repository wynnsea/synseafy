import { create } from "zustand";
import { Playlist } from "@/src/domain/entities/playlist";
import { Track } from "@/src/domain/entities/track";
import { getCatalogTrack } from "@/src/infrastructure/data/catalog";
import { userLibraryRepository } from "@/src/infrastructure/repositories/supabase-user-library-repository";
import {
  persist,
  requireSignIn,
} from "@/src/application/stores/user-data-sync";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import {
  deleteUserImage,
  prepareSquareImage,
  uploadUserImage,
} from "@/src/infrastructure/supabase/image-upload";

const COVER_PRESETS = [
  { from: "#0ea5e9", via: "#0284c7", to: "#082f49" },
  { from: "#22d3ee", via: "#2563eb", to: "#0f172a" },
  { from: "#38bdf8", via: "#0d9488", to: "#042f2e" },
  { from: "#60a5fa", via: "#4f46e5", to: "#1e1b4b" },
];

const RECENT_LIMIT = 12;

interface LibraryState {
  playlists: Playlist[];
  likedTrackIds: string[];
  recentTrackIds: string[];

  /** Replace everything with data loaded for the signed-in user (or clear on sign-out). */
  hydrate: (data: {
    playlists: Playlist[];
    likedTrackIds: string[];
    recentTrackIds: string[];
  }) => void;
  reset: () => void;

  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  recordPlayed: (trackId: string) => void;

  /** Returns null when the user isn't signed in. */
  createPlaylist: (name: string, description: string) => Playlist | null;
  updatePlaylist: (id: string, name: string, description: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  moveTrackInPlaylist: (
    playlistId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  reorderPlaylistTracks: (playlistId: string, trackIds: string[]) => void;

  /** Upload and set a custom cover. Resolves with an error message on failure. */
  setPlaylistCover: (playlistId: string, file: File) => Promise<string | null>;
  removePlaylistCover: (playlistId: string) => Promise<string | null>;
}

const EMPTY = { playlists: [], likedTrackIds: [], recentTrackIds: [] };

function tracksFor(trackIds: string[]): Track[] {
  return trackIds
    .map((id) => getCatalogTrack(id))
    .filter((t): t is Track => Boolean(t));
}

// Drag-to-reorder fires on every move; only the final order is worth saving
const SAVE_PLAYLIST_DELAY_MS = 600;
const pendingPlaylistSaves = new Map<string, ReturnType<typeof setTimeout>>();

export const useLibraryStore = create<LibraryState>((set, get) => {
  /** Apply a new track list to one playlist locally, then save it (debounced). */
  const setTrackIds = (playlistId: string, trackIds: string[]) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;
    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === playlistId ? { ...pl, trackIds } : pl
      ),
    }));

    clearTimeout(pendingPlaylistSaves.get(playlistId));
    pendingPlaylistSaves.set(
      playlistId,
      setTimeout(() => {
        pendingPlaylistSaves.delete(playlistId);
        const latest = get().playlists.find((pl) => pl.id === playlistId);
        if (!latest) return; // deleted meanwhile
        persist(
          userLibraryRepository.setPlaylistTracks(
            playlistId,
            tracksFor(latest.trackIds)
          ),
          "Couldn't update the playlist. Please try again."
        );
      }, SAVE_PLAYLIST_DELAY_MS)
    );
  };

  return {
    ...EMPTY,

    hydrate: (data) => set(data),
    reset: () => {
      pendingPlaylistSaves.forEach((t) => clearTimeout(t));
      pendingPlaylistSaves.clear();
      set(EMPTY);
    },

    toggleLike: (trackId) => {
      if (!requireSignIn("Sign in to save songs you like")) return;
      const track = getCatalogTrack(trackId);
      if (!track) return;

      const wasLiked = get().likedTrackIds.includes(trackId);
      set((state) => ({
        likedTrackIds: wasLiked
          ? state.likedTrackIds.filter((id) => id !== trackId)
          : [trackId, ...state.likedTrackIds],
      }));
      persist(
        wasLiked
          ? userLibraryRepository.unlike(track)
          : userLibraryRepository.like(track),
        "Couldn't update your liked songs. Please try again."
      );
    },

    isLiked: (trackId) => get().likedTrackIds.includes(trackId),

    // Local only: the play itself is saved to history by the activity store
    recordPlayed: (trackId) =>
      set((state) => ({
        recentTrackIds: [
          trackId,
          ...state.recentTrackIds.filter((id) => id !== trackId),
        ].slice(0, RECENT_LIMIT),
      })),

    createPlaylist: (name, description) => {
      if (!requireSignIn("Sign in to create playlists")) return null;
      const preset =
        COVER_PRESETS[get().playlists.length % COVER_PRESETS.length];
      const newPlaylist: Playlist = {
        // Generated here so the UI can use it before the server answers
        id: crypto.randomUUID(),
        name: name.trim() || "Untitled Ocean Mix",
        description:
          description.trim() || "Personal liquid playlist in Wynnsea.",
        coverGradient: preset,
        trackIds: [],
        createdAt: new Date().toISOString().slice(0, 10),
      };
      set((state) => ({ playlists: [newPlaylist, ...state.playlists] }));
      persist(
        userLibraryRepository.createPlaylist(newPlaylist),
        "Couldn't create the playlist. Please try again."
      );
      return newPlaylist;
    },

    updatePlaylist: (id, name, description) => {
      const current = get().playlists.find((pl) => pl.id === id);
      if (!current) return;
      const nextName = name.trim() || current.name;
      const nextDescription = description.trim();
      set((state) => ({
        playlists: state.playlists.map((pl) =>
          pl.id === id
            ? { ...pl, name: nextName, description: nextDescription }
            : pl
        ),
      }));
      persist(
        userLibraryRepository.updatePlaylist(id, nextName, nextDescription),
        "Couldn't save playlist details. Please try again."
      );
    },

    deletePlaylist: (id) => {
      const cover = get().playlists.find((pl) => pl.id === id)?.coverUrl;
      set((state) => ({
        playlists: state.playlists.filter((pl) => pl.id !== id),
      }));
      persist(
        userLibraryRepository.deletePlaylist(id).then(() =>
          // Only once the playlist is really gone
          deleteUserImage("playlist-covers", cover).catch(() => {})
        ),
        "Couldn't delete the playlist. Please try again."
      );
    },

    addTrackToPlaylist: (playlistId, trackId) => {
      if (!requireSignIn("Sign in to build playlists")) return;
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!playlist || playlist.trackIds.includes(trackId)) return;
      setTrackIds(playlistId, [...playlist.trackIds, trackId]);
    },

    removeTrackFromPlaylist: (playlistId, trackId) => {
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!playlist) return;
      setTrackIds(
        playlistId,
        playlist.trackIds.filter((t) => t !== trackId)
      );
    },

    moveTrackInPlaylist: (playlistId, fromIndex, toIndex) => {
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!playlist) return;
      const n = playlist.trackIds.length;
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= n || toIndex >= n) return;
      const next = [...playlist.trackIds];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setTrackIds(playlistId, next);
    },

    reorderPlaylistTracks: (playlistId, trackIds) =>
      setTrackIds(playlistId, trackIds),

    setPlaylistCover: async (playlistId, file) => {
      const user = useAuthStore.getState().user;
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!user || !playlist) return "Sign in to change playlist covers.";
      try {
        const image = await prepareSquareImage(file);
        const url = await uploadUserImage("playlist-covers", user.id, playlistId, image);
        await userLibraryRepository.updatePlaylistCover(playlistId, url);
        set((state) => ({
          playlists: state.playlists.map((pl) =>
            pl.id === playlistId ? { ...pl, coverUrl: url } : pl
          ),
        }));
        // Only after the new cover is saved, so a failure never loses the old one
        void deleteUserImage("playlist-covers", playlist.coverUrl).catch(() => {});
        return null;
      } catch (err) {
        return (err as Error).message || "Couldn't update the cover.";
      }
    },

    removePlaylistCover: async (playlistId) => {
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!playlist?.coverUrl) return null;
      try {
        await userLibraryRepository.updatePlaylistCover(playlistId, null);
        set((state) => ({
          playlists: state.playlists.map((pl) =>
            pl.id === playlistId ? { ...pl, coverUrl: undefined } : pl
          ),
        }));
        void deleteUserImage("playlist-covers", playlist.coverUrl).catch(() => {});
        return null;
      } catch (err) {
        return (err as Error).message || "Couldn't remove the cover.";
      }
    },
  };
});
