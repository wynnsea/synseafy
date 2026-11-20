"use client";

import { useEffect } from "react";
import { LyricLine, Track } from "@/src/domain/entities/track";
import { useCatalogStore } from "@/src/application/stores/use-catalog-store";

export type LyricsStatus = "loading" | "ready" | "unavailable" | "error";

interface TrackLyricsState {
  status: LyricsStatus;
  lines: LyricLine[];
  /** True when lines have real start times (enables highlight + tap-to-seek) */
  timed: boolean;
  /** Index of the line being sung, or -1 when not timed / before the first line */
  activeIndex: number;
}

/** Lyrics for the song, loaded on demand, with the line active at `currentTime`. */
export function useTrackLyrics(track: Track, currentTime: number, enabled = true): TrackLyricsState {
  const entry = useCatalogStore((s) => s.lyrics[track.videoId]);
  const loadLyrics = useCatalogStore((s) => s.loadLyrics);

  useEffect(() => {
    if (enabled && track.videoId) loadLyrics(track);
  }, [enabled, track, loadLyrics]);

  if (!entry || entry === "loading") return { status: "loading", lines: [], timed: false, activeIndex: -1 };
  if (entry === "error") return { status: "error", lines: [], timed: false, activeIndex: -1 };
  if (!entry.available || entry.lines.length === 0) {
    return { status: "unavailable", lines: [], timed: false, activeIndex: -1 };
  }

  const activeIndex = entry.timed
    ? entry.lines.reduce((acc, line, idx) => (currentTime >= line.time ? idx : acc), -1)
    : -1;
  return { status: "ready", lines: entry.lines, timed: entry.timed, activeIndex };
}
