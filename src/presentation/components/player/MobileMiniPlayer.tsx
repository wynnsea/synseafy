"use client";

import React from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";

export function MobileMiniPlayer() {
  const { currentTrack, isPlaying, currentTime, togglePlay, nextTrack } =
    usePlayerStore();
  const setNowPlayingOpen = useUiStore((s) => s.setNowPlayingOpen);
  const hasActiveTrack = usePlayerStore((s) => s.hasActiveTrack);

  if (!hasActiveTrack) return null;

  const progressPct =
    currentTrack.duration > 0
      ? Math.min(100, (currentTime / currentTrack.duration) * 100)
      : 0;

  return (
    <div className="md:hidden fixed bottom-[86px] inset-x-4 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[390px] liquid-glass-bar rounded-full p-2 pr-3 flex items-center gap-3 relative overflow-hidden">
        {/* Subtle bottom progress glow line */}
        <div
          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-white/10 overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full ocean-gradient-soft transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <button
          onClick={() => setNowPlayingOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
        >
          <TrackArtwork
            track={currentTrack}
            className="w-10 h-10 ring-2 ring-sky-400/35"
            rounded="full"
            spinning={isPlaying}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">
              {currentTrack.artist}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-9 h-9 rounded-full ocean-gradient-btn flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            aria-label="Next track"
            className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
