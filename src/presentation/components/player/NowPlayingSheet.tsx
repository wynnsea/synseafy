"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Heart,
  Mic2,
  ListMusic,
  Disc3,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { formatDuration } from "@/src/application/use-cases/format-time";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { useTrackLyrics } from "@/src/application/hooks/use-track-lyrics";
import { LyricsLines } from "@/src/presentation/components/player/LyricsLines";
import { WaveformSeekbar } from "@/src/presentation/components/player/WaveformSeekbar";

type SheetView = "player" | "lyrics" | "queue";

export function NowPlayingSheet() {
  const isOpen = useUiStore((s) => s.isNowPlayingOpen);
  const setOpen = useUiStore((s) => s.setNowPlayingOpen);
  const [view, setView] = useState<SheetView>("player");

  const {
    currentTrack,
    queue,
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
    skipBy,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playTrack,
  } = usePlayerStore();

  const { likedTrackIds, toggleLike, recordPlayed } = useLibraryStore();
  const liked = likedTrackIds.includes(currentTrack.id);
  const progress =
    currentTrack.duration > 0 ? currentTime / currentTrack.duration : 0;

  const lyrics = useTrackLyrics(
    currentTrack,
    currentTime,
    isOpen && view === "lyrics",
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-[var(--bg-canvas)]/95 md:bg-[var(--bg-canvas)]/80"
        >
          {/* GPU-friendly slide-up sheet (no full-screen animated backdrop-blur jank!) */}
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 48, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[100dvh] md:h-auto md:max-w-[440px] md:max-h-[820px] md:rounded-[38px] liquid-glass-dock flex flex-col justify-between px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-5 overflow-hidden will-change-transform"
          >
            {/* Lightweight static ambient tint inside sheet */}
            <div
              className="absolute inset-0 pointer-events-none opacity-45 transition-colors duration-700"
              style={{
                background: `radial-gradient(circle at 50% 28%, ${currentTrack.ambient.primary}, transparent 62%)`,
              }}
            />

            {/* Top Bar: Back, "Playing", Like */}
            <div className="flex items-center justify-between shrink-0 z-10">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close Now Playing"
                className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:scale-105 transition-transform cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center min-w-0 px-2">
                <span className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">
                  {view === "player"
                    ? "Playing"
                    : view === "lyrics"
                      ? "Lyrics"
                      : "Up Next"}
                </span>
                <span className="text-[11px] text-[var(--accent-cyan)] truncate max-w-[180px]">
                  {currentTrack.album}
                </span>
              </div>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                aria-label={liked ? "Unlike song" : "Like song"}
                className={`w-10 h-10 rounded-full liquid-pill flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${
                  liked ? "text-sky-400" : "text-[var(--text-primary)]"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Center Content: Full glow breathing room so circular art never clips */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center my-2 z-10">
              {view === "player" && (
                <div className="flex flex-col items-center justify-center w-full py-4">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div
                      className="absolute -inset-3 rounded-full blur-xl opacity-45 pointer-events-none"
                      style={{ background: currentTrack.ambient.glow }}
                    />
                    <div className="p-1.5 rounded-full liquid-pill shadow-xl">
                      <TrackArtwork
                        track={currentTrack}
                        className="w-40 h-40 sm:w-48 sm:h-48 shadow-2xl"
                        rounded="full"
                        spinning={isPlaying}
                      />
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5 text-center px-3 max-w-full">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] truncate">
                      {currentTrack.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate mt-0.5">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>
              )}

              {view === "lyrics" && (
                <LyricsLines
                  lyrics={lyrics}
                  onSeek={seek}
                  align="center"
                  resetKey={currentTrack.id}
                  className="w-full h-full px-3 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
                />
              )}

              {view === "queue" && (
                <div className="w-full h-full overflow-y-auto no-scrollbar space-y-2 px-1 py-2">
                  {queue.map((track) => {
                    const active = track.id === currentTrack.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          playTrack(track);
                          recordPlayed(track.id);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-full transition-all text-left cursor-pointer ${
                          active
                            ? "ocean-gradient-btn"
                            : "liquid-pill hover:bg-[var(--glass-bg-hover)]"
                        }`}
                      >
                        <TrackArtwork
                          track={track}
                          className="w-9 h-9"
                          rounded="full"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              active
                                ? "text-white"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            {track.title}
                          </p>
                          <p
                            className={`text-[11px] truncate ${
                              active
                                ? "text-sky-100"
                                : "text-[var(--text-secondary)]"
                            }`}
                          >
                            {track.artist}
                          </p>
                        </div>
                        <span
                          className={`text-[11px] font-mono pr-2 ${
                            active ? "text-white" : "text-[var(--text-muted)]"
                          }`}
                        >
                          {formatDuration(track.duration)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Liquid Glass Control Sheet (never clips/overflows!) */}
            <div className="liquid-glass rounded-[28px] p-4 flex flex-col gap-3.5 shrink-0 z-10 w-full">
              {/* Centered Mode Tabs */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setView("player")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    view === "player"
                      ? "ocean-gradient-btn"
                      : "liquid-pill text-[var(--text-secondary)]"
                  }`}
                >
                  <Disc3 className="w-3.5 h-3.5" />
                  Cover
                </button>
                <button
                  onClick={() => setView("lyrics")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    view === "lyrics"
                      ? "ocean-gradient-btn"
                      : "liquid-pill text-[var(--text-secondary)]"
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  Lyrics
                </button>
                <button
                  onClick={() => setView("queue")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    view === "queue"
                      ? "ocean-gradient-btn"
                      : "liquid-pill text-[var(--text-secondary)]"
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  Queue
                </button>
              </div>

              {/* Symmetrical Row: Shuffle (left) — Volume (center) — Repeat (right) */}
              <div className="flex items-center justify-between gap-3 px-1">
                <button
                  onClick={toggleShuffle}
                  className={`p-1.5 transition-colors cursor-pointer shrink-0 ${
                    isShuffle
                      ? "text-[var(--accent-cyan)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  aria-label="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={toggleMute}
                    className="text-[var(--text-secondary)] cursor-pointer shrink-0"
                    aria-label="Mute"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full max-w-[150px] accent-sky-400 cursor-pointer h-1.5 rounded-full"
                    aria-label="Volume slider"
                  />
                  <Volume2 className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                </div>

                <button
                  onClick={cycleRepeat}
                  className={`p-1.5 transition-colors cursor-pointer shrink-0 ${
                    repeatMode !== "off"
                      ? "text-[var(--accent-cyan)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  aria-label="Repeat"
                >
                  {repeatMode === "one" ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={prevTrack}
                  aria-label="Previous"
                  className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={() => skipBy(-10)}
                  aria-label="Rewind 10 seconds"
                  className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-[9px] font-mono -mt-0.5">10</span>
                </button>

                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full ocean-gradient-btn flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => skipBy(10)}
                  aria-label="Forward 10 seconds"
                  className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="text-[9px] font-mono -mt-0.5">10</span>
                </button>

                <button
                  onClick={nextTrack}
                  aria-label="Next"
                  className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Interactive Glowing Waveform Seekbar */}
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono text-[var(--text-secondary)] w-9 shrink-0">
                  {formatDuration(currentTime)}
                </span>
                <div className="flex-1 min-w-0">
                  <WaveformSeekbar
                    waveform={currentTrack.waveform}
                    progress={progress}
                    onSeek={(ratio) =>
                      seek(Math.round(ratio * currentTrack.duration))
                    }
                    height={36}
                  />
                </div>
                <span className="text-[11px] font-mono text-[var(--text-secondary)] w-9 text-right shrink-0">
                  {formatDuration(currentTrack.duration)}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
