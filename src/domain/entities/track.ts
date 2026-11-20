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
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
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
  lyrics: LyricLine[];
  isTrending?: boolean;
  isPopular?: boolean;
}
