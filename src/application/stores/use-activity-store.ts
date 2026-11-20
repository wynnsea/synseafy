import { create } from "zustand";
import { Track } from "@/src/domain/entities/track";
import type { PlayRecord } from "@/src/domain/repositories/user-library-repository";
import { getCatalogTrack, registerTracks } from "@/src/infrastructure/data/catalog";
import { buildTrack } from "@/src/infrastructure/data/track-factory";
import { userLibraryRepository } from "@/src/infrastructure/repositories/supabase-user-library-repository";
import { isSignedIn, persist } from "@/src/application/stores/user-data-sync";
import { takePendingListen } from "@/src/application/stores/pending-listen";

export type { PlayRecord };

/** Like Spotify: a song only counts as played after this much actual listening. */
export const MIN_SECONDS_FOR_PLAY = 30;

const LOCAL_LIMIT = 500;

interface ActivityState {
  records: PlayRecord[];
  hydrate: (records: PlayRecord[]) => void;
  reset: () => void;
  /**
   * Record a finished listen. Ignored below MIN_SECONDS_FOR_PLAY.
   * `secondsListened` is time actually played (pauses and seeks excluded).
   */
  logPlay: (track: Track, secondsListened: number, playedAt?: string) => void;
  /** Save a listen left over from a closed tab (call after hydrate). */
  flushPendingListen: () => void;
  clearRecords: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  records: [],

  hydrate: (records) => set({ records }),
  reset: () => set({ records: [] }),

  logPlay: (track, secondsListened, playedAt) => {
    const seconds = Math.round(secondsListened);
    if (seconds < MIN_SECONDS_FOR_PLAY) return;
    const at = playedAt ?? new Date().toISOString();

    set((state) => ({
      records: [
        {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          trackId: track.id,
          playedAt: at,
          durationListened: seconds,
        },
        ...state.records,
      ]
        // keep newest first even when an older pending listen is added late
        .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
        .slice(0, LOCAL_LIMIT),
    }));

    // Guests keep this session's history in memory only
    if (isSignedIn()) {
      persist(
        userLibraryRepository.logPlay(track, seconds, at),
        "Couldn't save this play to your history."
      );
    }
  },

  flushPendingListen: () => {
    const pending = takePendingListen();
    if (!pending || !isSignedIn()) return;
    let track = getCatalogTrack(pending.trackId);
    if (!track && pending.track?.videoId) {
      track = buildTrack(pending.track);
      registerTracks([track]);
    }
    if (track) get().logPlay(track, pending.secondsListened, pending.playedAt);
  },

  clearRecords: () => {
    set({ records: [] });
    if (isSignedIn()) {
      persist(
        userLibraryRepository.clearHistory(),
        "Couldn't clear your history. Please try again."
      );
    }
  },
}));
