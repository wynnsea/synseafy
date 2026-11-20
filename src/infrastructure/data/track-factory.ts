import { Track } from "@/src/domain/entities/track";

/** Minimal song facts we get from YouTube Music or the database cache. */
export interface TrackSeed {
  videoId: string;
  title: string;
  artists: string[];
  album?: string | null;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  isExplicit?: boolean;
}

// Ocean-toned palettes the UI was designed around; one is picked per song
const PALETTES = [
  { from: "#0ea5e9", via: "#0284c7", to: "#082f49", accent: "#7dd3fc", primary: "#0ea5e9", secondary: "#0369a1", glow: "rgba(14,165,233,0.55)" },
  { from: "#22d3ee", via: "#2563eb", to: "#0f172a", accent: "#a5f3fc", primary: "#22d3ee", secondary: "#2563eb", glow: "rgba(34,211,238,0.5)" },
  { from: "#38bdf8", via: "#0d9488", to: "#042f2e", accent: "#99f6e4", primary: "#14b8a6", secondary: "#0e7490", glow: "rgba(45,212,191,0.5)" },
  { from: "#60a5fa", via: "#4f46e5", to: "#1e1b4b", accent: "#c7d2fe", primary: "#6366f1", secondary: "#1d4ed8", glow: "rgba(99,102,241,0.5)" },
  { from: "#67e8f9", via: "#0891b2", to: "#083344", accent: "#cffafe", primary: "#06b6d4", secondary: "#155e75", glow: "rgba(6,182,212,0.5)" },
  { from: "#93c5fd", via: "#3b82f6", to: "#172554", accent: "#dbeafe", primary: "#3b82f6", secondary: "#1e3a8a", glow: "rgba(59,130,246,0.5)" },
] as const;

const PATTERNS: Track["artworkStyle"]["pattern"][] = [
  "waves",
  "orb",
  "prism",
  "aurora",
  "ripple",
  "coral",
];

/** Small stable string hash (FNV-1a) so a song always gets the same look. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Decorative waveform bars (not real audio analysis), deterministic per song. */
function makeWaveform(seed: number, length = 42): number[] {
  const bars: number[] = [];
  for (let i = 0; i < length; i++) {
    const wave =
      Math.sin((i + seed) * 0.45) * 0.3 + Math.cos((i * 1.7 + seed) * 0.35) * 0.25 + 0.5;
    const envelope = Math.sin((i / (length - 1)) * Math.PI);
    bars.push(Number(Math.max(0.18, Math.min(1, wave * (0.45 + envelope * 0.65))).toFixed(2)));
  }
  return bars;
}

/** Turn plain song facts into the full Track the UI renders. */
export function buildTrack(seed: TrackSeed): Track {
  const h = hash(seed.videoId);
  const palette = PALETTES[h % PALETTES.length];
  const artists = seed.artists.filter(Boolean);

  return {
    id: seed.videoId,
    videoId: seed.videoId,
    title: seed.title,
    artist: artists.join(", ") || "Unknown artist",
    artists,
    album: seed.album ?? "",
    duration: Math.max(0, seed.durationSeconds ?? 0),
    thumbnailUrl: seed.thumbnailUrl ?? undefined,
    isExplicit: seed.isExplicit ?? false,
    genre: "",
    playCount: "",
    artworkStyle: {
      from: palette.from,
      via: palette.via,
      to: palette.to,
      accent: palette.accent,
      pattern: PATTERNS[(h >>> 8) % PATTERNS.length],
    },
    ambient: {
      primary: palette.primary,
      secondary: palette.secondary,
      glow: palette.glow,
    },
    waveform: makeWaveform(h % 97),
    lyrics: [],
  };
}

/** Placeholder used by the player before the user picks a song (never shown). */
export const EMPTY_TRACK: Track = buildTrack({
  videoId: "",
  title: "",
  artists: [],
});
