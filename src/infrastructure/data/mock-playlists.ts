import { Playlist } from "@/src/domain/entities/playlist";

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: "pl-deep-ocean",
    name: "Deep Ocean Focus",
    description: "Ambient waves & soft cyan electronics for deep flow sessions.",
    coverGradient: {
      from: "#0284c7",
      via: "#0369a1",
      to: "#082f49",
    },
    trackIds: ["trk-1", "trk-3", "trk-7", "trk-5"],
    createdAt: "2026-10-12",
  },
  {
    id: "pl-midnight-cruise",
    name: "Midnight Harbor",
    description: "Late-night coastal drives with smooth R&B and synth pulses.",
    coverGradient: {
      from: "#06b6d4",
      via: "#1d4ed8",
      to: "#0f172a",
    },
    trackIds: ["trk-2", "trk-4", "trk-6", "trk-8"],
    createdAt: "2026-10-28",
  },
  {
    id: "pl-sea-glass",
    name: "Sea Glass Morning",
    description: "Airy indie & sunlit ocean melodies to start the day.",
    coverGradient: {
      from: "#38bdf8",
      via: "#0ea5e9",
      to: "#155e75",
    },
    trackIds: ["trk-7", "trk-5", "trk-2"],
    createdAt: "2026-11-05",
  },
];
