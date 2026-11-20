"use client";

import { useEffect, useState } from "react";
import { Track } from "@/src/domain/entities/track";
import { musicRepository } from "@/src/infrastructure/repositories/music-repository";

const DEBOUNCE_MS = 350;

/** Debounced song search. An empty query returns no results and no loading state. */
export function useSongSearch(query: string): { tracks: Track[]; loading: boolean } {
  const q = query.trim();
  const [result, setResult] = useState<{ q: string; tracks: Track[] }>({ q: "", tracks: [] });

  useEffect(() => {
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      musicRepository
        .searchTracks(q, "All", controller.signal)
        .then((tracks) => setResult({ q, tracks }))
        .catch((err: Error) => {
          if (err.name !== "AbortError") setResult({ q, tracks: [] });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  if (!q) return { tracks: [], loading: false };
  return result.q === q ? { tracks: result.tracks, loading: false } : { tracks: [], loading: true };
}
