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

  const liked = likedTrackIds.includes(currentTrack.id);
  const progress =
    currentTrack.duration > 0 ? currentTime / currentTrack.duration : 0;

  return (
    <div className="hidden md:block absolute bottom-0 inset-x-0 px-4 lg:px-7 pb-4 pt-8 z-40 pointer-events-none bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/92 to-transparent">
      <div className="pointer-events-auto max-w-[1380px] mx-auto liquid-glass-dock rounded-full px-6 py-3 flex items-center justify-between gap-5">
        {/* Left: Track Info */}
        <div className="flex items-center gap-3 w-[240px] lg:w-[270px] min-w-0">
          <button
            onClick={() => setNowPlayingOpen(true)}
            className="relative group cursor-pointer shrink-0"
            title="Open Fullscreen Player"
          >
            <TrackArtwork
              track={currentTrack}
              className="w-12 h-12 ring-2 ring-white/30"
              rounded="full"
              spinning={isPlaying}
            />
            <span className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white" />
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <button
              onClick={() => setNowPlayingOpen(true)}
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-cyan)] truncate block max-w-full text-left transition-colors cursor-pointer"
            >
              {currentTrack.title}
            </button>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack.id)}
            aria-label="Like track"
            className={`w-9 h-9 rounded-full liquid-pill flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              liked
                ? "text-sky-400 scale-105"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Center: Controls + Interactive Waveform */}
        <div className="flex-1 max-w-[540px] flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              title="Shuffle"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isShuffle
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              title="Previous"
              className="p-1.5 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
              className="w-11 h-11 rounded-full ocean-gradient-btn flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white text-white" />
              ) : (
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              title="Next"
              className="p-1.5 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeatMode}`}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== "off"
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-[var(--text-secondary)] w-10 text-right">
              {formatDuration(currentTime)}
            </span>
            <WaveformSeekbar
              waveform={currentTrack.waveform}
              progress={progress}
              onSeek={(ratio) => seek(Math.round(ratio * currentTrack.duration))}
              height={22}
              compact
            />
            <span className="text-[11px] font-mono text-[var(--text-secondary)] w-10">
              {formatDuration(currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* Right: Lyrics, Queue & Volume */}
        <div className="flex items-center justify-end gap-2.5 w-[220px] lg:w-[240px]">
          <button
            onClick={() => toggleDrawer("lyrics")}
            title="Lyrics"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeDrawer === "lyrics"
                ? "ocean-gradient-btn"
                : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleDrawer("queue")}
            title="Queue"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeDrawer === "queue"
                ? "ocean-gradient-btn"
                : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 ml-1">
            <button
              onClick={toggleMute}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 accent-sky-400 cursor-pointer h-1.5 rounded-full"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
