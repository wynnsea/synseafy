import { create } from "zustand";
import { RepeatMode } from "@/src/domain/entities/player";
import { Track } from "@/src/domain/entities/track";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";

interface PlayerState {
  currentTrack: Track;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;

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
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: MOCK_TRACKS[0],
  queue: MOCK_TRACKS,
  isPlaying: false,
  currentTime: 68,
  volume: 0.78,
  isMuted: false,
  isShuffle: false,
  repeatMode: "all",

  playTrack: (track, newQueue) =>
    set((state) => ({
      currentTrack: track,
      queue: newQueue ?? state.queue,
      isPlaying: true,
      currentTime: 0,
    })),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  seek: (seconds) =>
    set((state) => ({
      currentTime: Math.max(0, Math.min(state.currentTrack.duration, seconds)),
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
    const { isPlaying, currentTime, currentTrack, repeatMode } = get();
    if (!isPlaying) return;
    if (currentTime + 1 >= currentTrack.duration) {
      if (repeatMode === "one") {
        set({ currentTime: 0 });
      } else {
        get().nextTrack();
      }
    } else {
      set({ currentTime: currentTime + 1 });
    }
  },

  nextTrack: () => {
    const { queue, currentTrack, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

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
    const { queue, currentTrack, currentTime } = get();
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
}));
