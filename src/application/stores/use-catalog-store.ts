import { create } from "zustand";
import { Track } from "@/src/domain/entities/track";
import { appConfig } from "@/src/infrastructure/config/app-config";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { toSlug } from "@/src/application/use-cases/slugify";
import {
  CatalogArtist,
  fetchHome,
  fetchLyrics,
  HomeFeed,
  TrackLyrics,
} from "@/src/infrastructure/api/music-api";

export type { CatalogArtist, HomeFeed, TrackLyrics };

type LoadStatus = "idle" | "loading" | "ready" | "error";

/** Lyrics per videoId: loaded result, or the request state while there's none yet. */
export type LyricsEntry = TrackLyrics | "loading" | "error";

interface CatalogState {
  home: HomeFeed | null;
  homeStatus: LoadStatus;
  homeError: string | null;
  /** Load the home feed once (call again to retry after an error). */
  loadHome: () => void;

  lyrics: Record<string, LyricsEntry>;
  loadLyrics: (track: Track) => void;
}

function mockHome(): HomeFeed {
  const seen = new Map<string, CatalogArtist>();
  for (const t of MOCK_TRACKS) {
    if (!seen.has(t.artist)) seen.set(t.artist, { id: toSlug(t.artist), name: t.artist });
  }
  return {
    trending: MOCK_TRACKS.filter((t) => t.isTrending),
    quickPicks: MOCK_TRACKS,
    artists: Array.from(seen.values()),
  };
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  home: null,
  homeStatus: "idle",
  homeError: null,

  loadHome: () => {
    const { homeStatus } = get();
    if (homeStatus === "loading" || homeStatus === "ready") return;

    if (appConfig.useMockData) {
      set({ home: mockHome(), homeStatus: "ready", homeError: null });
      return;
    }

    set({ homeStatus: "loading", homeError: null });
    fetchHome()
      .then((home) => set({ home, homeStatus: "ready" }))
      .catch((err: Error) =>
        set({ homeStatus: "error", homeError: err.message || "Couldn't load music." })
      );
  },

  lyrics: {},

  loadLyrics: (track) => {
    const existing = get().lyrics[track.videoId];
    if (existing && existing !== "error") return;

    // Mock songs ship with timed lyrics
    if (appConfig.useMockData || track.lyrics.length > 0) {
      set((s) => ({
        lyrics: {
          ...s.lyrics,
          [track.videoId]: {
            available: track.lyrics.length > 0,
            timed: true,
            lines: track.lyrics,
          },
        },
      }));
      return;
    }

    set((s) => ({ lyrics: { ...s.lyrics, [track.videoId]: "loading" } }));
    fetchLyrics(track.videoId)
      .then((result) =>
        set((s) => ({ lyrics: { ...s.lyrics, [track.videoId]: result } }))
      )
      .catch(() => set((s) => ({ lyrics: { ...s.lyrics, [track.videoId]: "error" } })));
  },
}));
