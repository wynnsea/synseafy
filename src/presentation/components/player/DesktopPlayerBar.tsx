"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
} from "lucide-react";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { formatDuration } from "@/src/application/use-cases/format-time";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { WaveformSeekbar } from "@/src/presentation/components/player/WaveformSeekbar";

export function DesktopPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const { activeDrawer, toggleDrawer, setNowPlayingOpen } = useUiStore();

  const hasActiveTrack = usePlayerStore((s) => s.hasActiveTrack);
  if (!hasActiveTrack) return null;

  const liked = likedTrackIds.includes(currentTrack.id);
  const progress =
    currentTrack.duration > 0 ? currentTime / currentTrack.duration : 0;

  // Sized with container queries (@2xl / @4xl = the bar's own width), because the
  // xl right rail makes this column narrower than the viewport suggests.
  return (
    <div className="@container hidden md:block absolute bottom-0 inset-x-0 px-3 @2xl:px-7 pb-4 pt-8 z-40 pointer-events-none bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/92 to-transparent">
      <div className="pointer-events-auto max-w-[1380px] mx-auto liquid-glass-dock rounded-full px-3.5 @2xl:px-6 py-2.5 @2xl:py-3 flex items-center justify-between gap-3 @2xl:gap-5">
        {/* Left: Track Info (fluid on tablet, generous on desktop) */}
        <div className="flex items-center gap-2.5 @2xl:gap-3 min-w-0 w-[170px] @2xl:w-[220px] @4xl:w-[260px] shrink-0">
          <button
            onClick={() => setNowPlayingOpen(true)}
            className="relative group cursor-pointer shrink-0"
            title="Open Fullscreen Player"
          >
            <TrackArtwork
              track={currentTrack}
              className="w-10 h-10 @2xl:w-12 @2xl:h-12 ring-2 ring-white/30"
              rounded="full"
              spinning={isPlaying}
            />
            <span className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <button
              onClick={() => setNowPlayingOpen(true)}
              className="text-xs @2xl:text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-cyan)] truncate block max-w-full text-left transition-colors cursor-pointer"
            >
              {currentTrack.title}
            </button>
            <p className="text-[11px] @2xl:text-xs text-[var(--text-secondary)] truncate">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack.id)}
            aria-label="Like track"
            className={`hidden @4xl:flex w-9 h-9 rounded-full liquid-pill items-center justify-center transition-all cursor-pointer shrink-0 ${
              liked
                ? "text-sky-400 scale-105"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Center: Controls + Interactive Waveform (fluid flex-1 min-w-0) */}
        <div className="flex-1 min-w-0 max-w-[520px] flex flex-col items-center gap-1 @2xl:gap-1.5">
          <div className="flex items-center gap-2.5 @2xl:gap-4">
            <button
              onClick={toggleShuffle}
              title="Shuffle"
              className={`p-1 @2xl:p-1.5 rounded-full transition-colors cursor-pointer ${
                isShuffle
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
            </button>

            <button
              onClick={prevTrack}
              title="Previous"
              className="p-1 @2xl:p-1.5 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4 @2xl:w-5 @2xl:h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
              className="w-9 h-9 @2xl:w-11 @2xl:h-11 rounded-full ocean-gradient-btn flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 @2xl:w-5 @2xl:h-5 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 @2xl:w-5 @2xl:h-5 fill-white text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              title="Next"
              className="p-1 @2xl:p-1.5 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4 @2xl:w-5 @2xl:h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeatMode}`}
              className={`p-1 @2xl:p-1.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== "off"
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
              ) : (
                <Repeat className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
              )}
            </button>
          </div>

          <div className="w-full flex items-center gap-2 @2xl:gap-3 min-w-0">
            <span className="text-[10px] @2xl:text-[11px] font-mono text-[var(--text-secondary)] w-8 @2xl:w-10 text-right shrink-0">
              {formatDuration(currentTime)}
            </span>
            <div className="flex-1 min-w-0">
              <WaveformSeekbar
                waveform={currentTrack.waveform}
                progress={progress}
                onSeek={(ratio) =>
                  seek(Math.round(ratio * currentTrack.duration))
                }
                height={20}
                compact
              />
            </div>
            <span className="text-[10px] @2xl:text-[11px] font-mono text-[var(--text-secondary)] w-8 @2xl:w-10 shrink-0">
              {formatDuration(currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* Right: Lyrics, Queue & Volume (compact on tablet, full slider on xl) */}
        <div className="flex items-center justify-end gap-1.5 @2xl:gap-2.5 shrink-0">
          <button
            onClick={() => toggleDrawer("lyrics")}
            title="Lyrics"
            className={`w-8 h-8 @2xl:w-9 @2xl:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeDrawer === "lyrics"
                ? "ocean-gradient-btn"
                : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Mic2 className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
          </button>

          <button
            onClick={() => toggleDrawer("queue")}
            title="Queue"
            className={`w-8 h-8 @2xl:w-9 @2xl:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeDrawer === "queue"
                ? "ocean-gradient-btn"
                : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
          </button>

          <div className="flex items-center gap-2 ml-0.5">
            <button
              onClick={toggleMute}
              className="w-8 h-8 @2xl:w-auto @2xl:h-auto rounded-full liquid-pill @2xl:bg-transparent @2xl:border-0 @2xl:shadow-none flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 @2xl:w-4 @2xl:h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="hidden @4xl:block w-20 accent-sky-400 cursor-pointer h-1.5 rounded-full"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
