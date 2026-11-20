import { create } from "zustand";
import { Track } from "@/src/domain/entities/track";

export interface PlayRecord {
  id: string;
  trackId: string;
  playedAt: string; // ISO string
  durationListened: number; // seconds
}

function makePastIso(hoursAgo: number, minuteOffset = 0): string {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000 - minuteOffset * 60 * 1000);
  return d.toISOString();
}

// Rich initial listening records so Recap, Hourly Chart & Poster look alive immediately
const INITIAL_RECORDS: PlayRecord[] = [
  { id: "rec-1", trackId: "trk-1", playedAt: makePastIso(0, 18), durationListened: 248 },
  { id: "rec-2", trackId: "trk-2", playedAt: makePastIso(1, 5), durationListened: 214 },
  { id: "rec-3", trackId: "trk-1", playedAt: makePastIso(2, 22), durationListened: 248 },
  { id: "rec-4", trackId: "trk-4", playedAt: makePastIso(3, 40), durationListened: 232 },
  { id: "rec-5", trackId: "trk-6", playedAt: makePastIso(5, 12), durationListened: 221 },
  { id: "rec-6", trackId: "trk-1", playedAt: makePastIso(12, 30), durationListened: 248 },
  { id: "rec-7", trackId: "trk-3", playedAt: makePastIso(13, 15), durationListened: 196 },
  { id: "rec-8", trackId: "trk-2", playedAt: makePastIso(14, 48), durationListened: 214 },
  { id: "rec-9", trackId: "trk-1", playedAt: makePastIso(15, 10), durationListened: 248 },
  { id: "rec-10", trackId: "trk-5", playedAt: makePastIso(18, 5), durationListened: 265 },
  { id: "rec-11", trackId: "trk-4", playedAt: makePastIso(23, 20), durationListened: 232 },
  { id: "rec-12", trackId: "trk-2", playedAt: makePastIso(25, 45), durationListened: 214 },
  { id: "rec-13", trackId: "trk-6", playedAt: makePastIso(27, 10), durationListened: 221 },
  { id: "rec-14", trackId: "trk-7", playedAt: makePastIso(30, 35), durationListened: 204 },
  { id: "rec-15", trackId: "trk-1", playedAt: makePastIso(36, 12), durationListened: 248 },
  { id: "rec-16", trackId: "trk-3", playedAt: makePastIso(38, 50), durationListened: 196 },
  { id: "rec-17", trackId: "trk-8", playedAt: makePastIso(42, 15), durationListened: 241 },
  { id: "rec-18", trackId: "trk-2", playedAt: makePastIso(48, 25), durationListened: 214 },
];

interface ActivityState {
  records: PlayRecord[];
  logPlay: (track: Track) => void;
  clearRecords: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  records: INITIAL_RECORDS,

  logPlay: (track) =>
    set((state) => ({
      records: [
        {
          id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          trackId: track.id,
          playedAt: new Date().toISOString(),
          durationListened: track.duration,
        },
        ...state.records,
      ].slice(0, 200),
    })),

  clearRecords: () => set({ records: [] }),
}));
