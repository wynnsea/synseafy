import { create } from "zustand";
import { RepeatMode } from "@/src/domain/entities/player";
import { Track } from "@/src/domain/entities/track";
import { EMPTY_TRACK } from "@/src/infrastructure/data/track-factory";
import { appConfig } from "@/src/infrastructure/config/app-config";
import { fetchUpNext } from "@/src/infrastructure/api/music-api";
import { usePreferencesStore } from "@/src/application/stores/use-preferences-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useActivityStore } from "@/src/application/stores/use-activity-store";
import {
  clearPendingListen,
  stashPendingListen,
} from "@/src/application/stores/pending-listen";

interface PlayerState {
  /**
   * False until the user picks a song. `currentTrack` holds a placeholder before
   * that, so player UI (bar, mini player) and "now playing" marks stay hidden.
   */
  hasActiveTrack: boolean;
  currentTrack: Track;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;

  /**
   * Seconds actually played in the current listen of `currentTrack`
   * (pauses and seeks don't count). Becomes a history entry when the listen ends.
   */
  listenedSeconds: number;
  /** When the current listen started (ISO), or null before the first second. */
  listenStartedAt: string | null;
  /**
   * Bumped on every user seek (and restart), so the audio engine can tell a
   * requested jump apart from the time it reports back itself.
   */
  seekNonce: number;

  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  seek: (seconds: number) => void;
  skipBy: (delta: number) => void;
  tick: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  setQueue: (tracks: Track[]) => void;
  /** Stash the in-progress listen so it survives the page closing (pagehide). */
  stashListen: () => void;

  // --- Called by the YouTube engine (real playback) ---
  /** Once per second: position reported by the player; counts a listened second when audible. */
  syncFromEngine: (currentTime: number, audible: boolean) => void;
  /** The video finished: repeat it, or move on. */
  handleEnded: () => void;
  /** Fill in the duration when the catalog didn't know it. */
  setDurationIfUnknown: (seconds: number) => void;
}

const FRESH_LISTEN = { listenedSeconds: 0, listenStartedAt: null };

/** Autoplay ("radio") follows the Profile setting; mock songs have no radio. */
function autoplayEnabled(): boolean {
  return !appConfig.useMockData && usePreferencesStore.getState().autoplaySimilar;
}

// The song whose radio was last requested, and that request (shared by callers)
let radioSeed: string | null = null;
let radioRequest: Promise<boolean> | null = null;

export const usePlayerStore = create<PlayerState>((set, get) => {
  /**
   * Like Spotify's autoplay: append songs YouTube Music would play after `seed`
   * ("radio") to the queue, songs you haven't played recently first.
   * Resolves true when something was added.
   */
  const extendWithRadio = (seed: Track): Promise<boolean> => {
    if (!autoplayEnabled() || !seed.videoId) return Promise.resolve(false);
    if (radioSeed === seed.videoId && radioRequest) return radioRequest;
    radioSeed = seed.videoId;
    radioRequest = fetchUpNext(seed.videoId)
      .then((tracks) => {
        const inQueue = new Set(get().queue.map((t) => t.id));
        const recent = new Set(useLibraryStore.getState().recentTrackIds);
        const candidates = tracks.filter((t) => !inQueue.has(t.id));
        const ordered = [
          ...candidates.filter((t) => !recent.has(t.id)),
          ...candidates.filter((t) => recent.has(t.id)),
        ];
        if (ordered.length === 0) return false;
        set({ queue: [...get().queue, ...ordered] });
        return true;
      })
      .catch(() => false);
    return radioRequest;
  };

  /** When the current song is the last one queued, fetch what comes next early. */
  const prefetchRadioIfLast = () => {
    const { queue, currentTrack, repeatMode } = get();
    if (repeatMode !== "off") return;
    if (queue.findIndex((t) => t.id === currentTrack.id) === queue.length - 1) {
      void extendWithRadio(currentTrack);
    }
  };

  /**
   * End the current listen: hand it to the activity store (which only keeps it
   * if it reached 30s) and start counting from zero for whatever plays next.
   * Call before switching or restarting a track.
   */
  const finishListen = () => {
    const { currentTrack, listenedSeconds, listenStartedAt } = get();
    if (listenedSeconds > 0) {
      useActivityStore
        .getState()
        .logPlay(currentTrack, listenedSeconds, listenStartedAt ?? undefined);
    }
    clearPendingListen();
    set(FRESH_LISTEN);
  };

  return {
    hasActiveTrack: false,
    currentTrack: EMPTY_TRACK,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    volume: 0.78,
    isMuted: false,
    isShuffle: false,
    // Off by default so the queue doesn't loop; autoplay continues with similar songs
    repeatMode: "off",
    ...FRESH_LISTEN,
    seekNonce: 0,

    playTrack: (track, newQueue) => {
      finishListen();
      set((state) => ({
        hasActiveTrack: true,
        currentTrack: track,
        // No list given: keep the queue if the song is in it (e.g. picked from
        // Up Next), otherwise start fresh from this song and let autoplay fill in
        queue:
          newQueue ??
          (state.queue.some((t) => t.id === track.id) ? state.queue : [track]),
        isPlaying: true,
        currentTime: 0,
      }));
      prefetchRadioIfLast();
    },

    // Nothing to play/pause until a song has been picked (e.g. Space key on load)
    togglePlay: () =>
      set((state) =>
        state.hasActiveTrack ? { isPlaying: !state.isPlaying } : state
      ),

    setPlaying: (playing) =>
      set((state) => (state.hasActiveTrack ? { isPlaying: playing } : state)),

    seek: (seconds) =>
      set((state) => ({
        currentTime: Math.max(
          0,
          Math.min(state.currentTrack.duration || seconds, seconds)
        ),
        seekNonce: state.seekNonce + 1,
      })),

    skipBy: (delta) => {
      const { currentTime, currentTrack, seekNonce } = get();
      set({
        currentTime: Math.max(
          0,
          Math.min(currentTrack.duration || currentTime + delta, currentTime + delta)
        ),
        seekNonce: seekNonce + 1,
      });
    },

    tick: () => {
      const {
        isPlaying,
        currentTime,
        currentTrack,
        repeatMode,
        listenedSeconds,
        listenStartedAt,
      } = get();
      if (!isPlaying) return;

      // This second was actually heard
      set({
        listenedSeconds: listenedSeconds + 1,
        listenStartedAt: listenStartedAt ?? new Date().toISOString(),
      });

      if (currentTime + 1 >= currentTrack.duration) {
        if (repeatMode === "one") {
          // Each loop is its own play
          finishListen();
          set((state) => ({ currentTime: 0, seekNonce: state.seekNonce + 1 }));
        } else {
          get().nextTrack();
        }
      } else {
        set({ currentTime: currentTime + 1 });
      }
    },

    nextTrack: () => {
      const { queue, currentTrack, isShuffle, repeatMode, hasActiveTrack } =
        get();
      if (!hasActiveTrack || queue.length === 0) return;
      finishListen();

      if (isShuffle && queue.length > 1) {
        const others = queue.filter((t) => t.id !== currentTrack.id);
        const random = others[Math.floor(Math.random() * others.length)];
        set({ currentTrack: random, currentTime: 0, isPlaying: true });
        return;
      }

      const idx = queue.findIndex((t) => t.id === currentTrack.id);
      const nextIdx = idx + 1;
      if (nextIdx < queue.length) {
        set({ currentTrack: queue[nextIdx], currentTime: 0, isPlaying: true });
        prefetchRadioIfLast();
      } else if (repeatMode === "all") {
        set({ currentTrack: queue[0], currentTime: 0, isPlaying: true });
      } else if (autoplayEnabled()) {
        // End of the queue: continue with similar songs
        void extendWithRadio(currentTrack).then((added) => {
          if (get().currentTrack.id !== currentTrack.id) return; // user moved on
          if (added) get().nextTrack();
          else set({ isPlaying: false, currentTime: currentTrack.duration });
        });
      } else {
        set({ isPlaying: false, currentTime: currentTrack.duration });
      }
    },

    prevTrack: () => {
      const { queue, currentTrack, currentTime, hasActiveTrack } = get();
      if (!hasActiveTrack) return;
      // Restarting the same song also starts a new listen
      finishListen();
      if (currentTime > 4) {
        set((state) => ({ currentTime: 0, seekNonce: state.seekNonce + 1 }));
        return;
      }
      if (queue.length === 0) return;
      const idx = queue.findIndex((t) => t.id === currentTrack.id);
      const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
      set({ currentTrack: queue[prevIdx], currentTime: 0, isPlaying: true });
    },

    setVolume: (vol) =>
      set({ volume: Math.max(0, Math.min(1, vol)), isMuted: vol === 0 }),

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

    cycleRepeat: () =>
      set((state) => ({
        repeatMode:
          state.repeatMode === "off"
            ? "all"
            : state.repeatMode === "all"
              ? "one"
              : "off",
      })),

    addToQueue: (track) =>
      set((state) => {
        if (state.queue.some((t) => t.id === track.id)) return state;
        return { queue: [...state.queue, track] };
      }),

    removeFromQueue: (trackId) =>
      set((state) => ({
        queue: state.queue.filter((t) => t.id !== trackId),
      })),

    moveQueueItem: (fromIndex, toIndex) =>
      set((state) => {
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= state.queue.length ||
          toIndex >= state.queue.length
        ) {
          return state;
        }
        const next = [...state.queue];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return { queue: next };
      }),

    setQueue: (tracks) => set({ queue: tracks }),

    syncFromEngine: (currentTime, audible) => {
      const { listenedSeconds, listenStartedAt } = get();
      set(
        audible
          ? {
              currentTime,
              listenedSeconds: listenedSeconds + 1,
              listenStartedAt: listenStartedAt ?? new Date().toISOString(),
            }
          : { currentTime }
      );
    },

    handleEnded: () => {
      if (get().repeatMode === "one") {
        // Each loop is its own play
        finishListen();
        set((state) => ({ currentTime: 0, isPlaying: true, seekNonce: state.seekNonce + 1 }));
        return;
      }
      get().nextTrack();
    },

    setDurationIfUnknown: (seconds) => {
      const { currentTrack } = get();
      if (currentTrack.duration > 0 || !(seconds > 0)) return;
      set({ currentTrack: { ...currentTrack, duration: Math.round(seconds) } });
    },

    stashListen: () => {
      const { currentTrack, listenedSeconds, listenStartedAt } = get();
      if (listenedSeconds > 0 && listenStartedAt) {
        stashPendingListen({
          trackId: currentTrack.id,
          secondsListened: listenedSeconds,
          playedAt: listenStartedAt,
          track: {
            videoId: currentTrack.videoId,
            title: currentTrack.title,
            artists: currentTrack.artists ?? [currentTrack.artist],
            album: currentTrack.album,
            durationSeconds: currentTrack.duration,
            thumbnailUrl: currentTrack.thumbnailUrl,
          },
        });
      }
    },
  };
});
