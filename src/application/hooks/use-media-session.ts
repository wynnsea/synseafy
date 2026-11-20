"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/src/application/stores/use-player-store";

const SKIP_SECONDS = 10;

/**
 * Lock-screen / notification / headset controls via the Media Session API:
 * shows the current song (title, artist, cover) and maps the system buttons
 * to the player store.
 */
export function useMediaSession(): void {
  const hasActiveTrack = usePlayerStore((s) => s.hasActiveTrack);
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);

  const supported = typeof navigator !== "undefined" && "mediaSession" in navigator;

  // Song info
  useEffect(() => {
    if (!supported) return;
    if (!hasActiveTrack) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || "Synseafy",
      artwork: track.thumbnailUrl
        ? [{ src: track.thumbnailUrl, sizes: "544x544", type: "image/jpeg" }]
        : [{ src: "/brand/logo-v3.png", sizes: "512x512", type: "image/png" }],
    });
  }, [supported, hasActiveTrack, track]);

  // Playing / paused indicator
  useEffect(() => {
    if (!supported) return;
    navigator.mediaSession.playbackState = !hasActiveTrack
      ? "none"
      : isPlaying
        ? "playing"
        : "paused";
  }, [supported, hasActiveTrack, isPlaying]);

  // Progress bar on the lock screen
  useEffect(() => {
    if (!supported || !hasActiveTrack || !(track.duration > 0)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: track.duration,
        playbackRate: 1,
        position: Math.min(Math.max(0, currentTime), track.duration),
      });
    } catch {
      // Some browsers reject position updates mid-track change; harmless
    }
  }, [supported, hasActiveTrack, track.duration, currentTime]);

  // System buttons → player
  useEffect(() => {
    if (!supported) return;
    const player = () => usePlayerStore.getState();
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => player().setPlaying(true)],
      ["pause", () => player().setPlaying(false)],
      ["nexttrack", () => player().nextTrack()],
      ["previoustrack", () => player().prevTrack()],
      ["seekforward", (d) => player().skipBy(d.seekOffset ?? SKIP_SECONDS)],
      ["seekbackward", (d) => player().skipBy(-(d.seekOffset ?? SKIP_SECONDS))],
      ["seekto", (d) => d.seekTime !== undefined && player().seek(d.seekTime)],
    ];
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Action not supported by this browser
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // ignore
        }
      }
    };
  }, [supported]);
}
