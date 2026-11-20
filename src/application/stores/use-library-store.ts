import { create } from "zustand";
import { Playlist } from "@/src/domain/entities/playlist";
import { MOCK_PLAYLISTS } from "@/src/infrastructure/data/mock-playlists";

const COVER_PRESETS = [
  { from: "#0ea5e9", via: "#0284c7", to: "#082f49" },
  { from: "#22d3ee", via: "#2563eb", to: "#0f172a" },
  { from: "#38bdf8", via: "#0d9488", to: "#042f2e" },
  { from: "#60a5fa", via: "#4f46e5", to: "#1e1b4b" },
];

interface LibraryState {
  playlists: Playlist[];
  likedTrackIds: string[];
  recentTrackIds: string[];

  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  recordPlayed: (trackId: string) => void;

  createPlaylist: (name: string, description: string) => Playlist;
  updatePlaylist: (id: string, name: string, description: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  playlists: MOCK_PLAYLISTS,
  likedTrackIds: ["trk-1", "trk-2", "trk-4"],
  recentTrackIds: ["trk-1", "trk-2", "trk-6", "trk-3", "trk-5"],

  toggleLike: (trackId) =>
    set((state) => ({
      likedTrackIds: state.likedTrackIds.includes(trackId)
        ? state.likedTrackIds.filter((id) => id !== trackId)
        : [trackId, ...state.likedTrackIds],
    })),

  isLiked: (trackId) => get().likedTrackIds.includes(trackId),

  recordPlayed: (trackId) =>
    set((state) => ({
      recentTrackIds: [
        trackId,
        ...state.recentTrackIds.filter((id) => id !== trackId),
      ].slice(0, 12),
    })),

  createPlaylist: (name, description) => {
    const preset =
      COVER_PRESETS[get().playlists.length % COVER_PRESETS.length];
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || "Untitled Ocean Mix",
      description:
        description.trim() || "Personal liquid playlist in Wynnsea.",
      coverGradient: preset,
      trackIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    set((state) => ({ playlists: [newPlaylist, ...state.playlists] }));
    return newPlaylist;
  },

  updatePlaylist: (id, name, description) =>
    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === id
          ? {
              ...pl,
              name: name.trim() || pl.name,
              description: description.trim(),
            }
          : pl
      ),
    })),

  deletePlaylist: (id) =>
    set((state) => ({
      playlists: state.playlists.filter((pl) => pl.id !== id),
    })),

  addTrackToPlaylist: (playlistId, trackId) =>
    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === playlistId && !pl.trackIds.includes(trackId)
          ? { ...pl, trackIds: [...pl.trackIds, trackId] }
          : pl
      ),
    })),

  removeTrackFromPlaylist: (playlistId, trackId) =>
    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === playlistId
          ? { ...pl, trackIds: pl.trackIds.filter((t) => t !== trackId) }
          : pl
      ),
    })),
}));
