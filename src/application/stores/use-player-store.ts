import { create } from "zustand";
import { RepeatMode } from "@/src/domain/entities/player";
import { Track } from "@/src/domain/entities/track";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
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
}

const FRESH_LISTEN = { listenedSeconds: 0, listenStartedAt: null };

export const usePlayerStore = create<PlayerState>((set, get) => {
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
    currentTrack: MOCK_TRACKS[0],
    queue: MOCK_TRACKS,
    isPlaying: false,
    currentTime: 0,
    volume: 0.78,
    isMuted: false,
    isShuffle: false,
    repeatMode: "all",
    ...FRESH_LISTEN,

    playTrack: (track, newQueue) => {
      finishListen();
      set((state) => ({
        hasActiveTrack: true,
        currentTrack: track,
        queue: newQueue ?? state.queue,
        isPlaying: true,
        currentTime: 0,
      }));
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
          Math.min(state.currentTrack.duration, seconds)
        ),
      })),

    skipBy: (delta) => {
      const { currentTime, currentTrack } = get();
      set({
        currentTime: Math.max(
          0,
          Math.min(currentTrack.duration, currentTime + delta)
        ),
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
          set({ currentTime: 0 });
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
      } else if (repeatMode === "all") {
        set({ currentTrack: queue[0], currentTime: 0, isPlaying: true });
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
        set({ currentTime: 0 });
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

    stashListen: () => {
      const { currentTrack, listenedSeconds, listenStartedAt } = get();
      if (listenedSeconds > 0 && listenStartedAt) {
        stashPendingListen({
          trackId: currentTrack.id,
          secondsListened: listenedSeconds,
          playedAt: listenStartedAt,
        });
      }
    },
  };
});
