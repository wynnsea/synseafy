export interface AmbientPalette {
  primary: string;
  secondary: string;
  glow: string;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface Track {
  /** Equal to `videoId` for real YouTube Music songs; "trk-*" for offline mock data. */
  id: string;
  videoId: string;
  title: string;
  /** All artists joined for display, e.g. "Tulus, Dhimasbad" */
  artist: string;
  /** Individual artist names (used to match artist pages) */
  artists?: string[];
  album: string;
  duration: number; // seconds
  /** Cover image from YouTube Music; when absent the gradient artwork is shown */
  thumbnailUrl?: string;
  isExplicit?: boolean;
  /** Mock data only; empty for YouTube Music songs */
  genre: string;
  playCount: string;
  songCountLabel?: string;
  artworkStyle: {
    from: string;
    via: string;
    to: string;
    accent: string;
    pattern: "waves" | "orb" | "prism" | "aurora" | "ripple" | "coral";
  };
  ambient: AmbientPalette;
  waveform: number[]; // normalized 0.15 - 1.0 heights
  /** Bundled lyrics (mock data). Real songs load lyrics on demand. */
  lyrics: LyricLine[];
  isTrending?: boolean;
  isPopular?: boolean;
}
