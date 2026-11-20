"use client";

import { useEffect, useState } from "react";
import { Track } from "@/src/domain/entities/track";
import { musicRepository } from "@/src/infrastructure/repositories/music-repository";

interface MoodTracks {
  tracks: Track[];
  loading: boolean;
  error: string | null;
}

/**
 * Songs for a mood/genre chip. "All" returns nothing (callers show their own
 * feed). Results for a chip are kept for the session so switching back is instant.
 */
const cache = new Map<string, Track[]>();

export function useMoodTracks(mood: string): MoodTracks {
  const [state, setState] = useState<{ mood: string } & MoodTracks>({
    mood: "",
    tracks: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (mood === "All" || cache.has(mood)) return;
    const controller = new AbortController();
    musicRepository
      .searchTracks("", mood, controller.signal)
      .then((tracks) => {
        cache.set(mood, tracks);
        setState({ mood, tracks, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setState({ mood, tracks: [], loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [mood]);

  if (mood === "All") return { tracks: [], loading: false, error: null };
  const cached = cache.get(mood);
  if (cached) return { tracks: cached, loading: false, error: null };
  if (state.mood === mood) return state;
  return { tracks: [], loading: true, error: null };
}
