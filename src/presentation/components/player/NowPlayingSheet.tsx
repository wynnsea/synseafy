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

  // Determine active lyric line
  const activeLyricIndex = currentTrack.lyrics.reduce((acc, line, idx) => {
    return currentTime >= line.time ? idx : acc;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-[var(--bg-canvas)]/80 backdrop-blur-2xl"
        >
          {/* Ambient glow inside fullscreen sheet */}
          <div
            className="absolute inset-0 pointer-events-none opacity-65 transition-colors duration-700"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${currentTrack.ambient.primary}, transparent 65%)`,
            }}
          />

          {/* Main phone/card container matching reference image */}
          <div className="relative w-full h-full md:max-w-[440px] md:max-h-[820px] md:rounded-[40px] liquid-glass-strong flex flex-col justify-between p-5 pt-6 overflow-hidden">
            {/* Top Bar: Back, "Playing", Menu/Tabs */}
            <div className="flex items-center justify-between z-10">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close Now Playing"
                className="w-11 h-11 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:scale-105 transition-transform cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">
                  {view === "player"
                    ? "Playing"
                    : view === "lyrics"
                      ? "Lyrics"
                      : "Up Next"}
                </span>
                <span className="text-[11px] text-[var(--accent-cyan)]">
                  {currentTrack.album}
                </span>
              </div>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                aria-label={liked ? "Unlike song" : "Like song"}
                className={`w-11 h-11 rounded-full liquid-pill flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${
                  liked ? "text-sky-400" : "text-[var(--text-primary)]"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Center Content: Circular Artwork OR Lyrics OR Queue */}
            <div className="flex-1 flex flex-col items-center justify-center my-4 min-h-0 z-10">
              {view === "player" && (
                <div className="flex flex-col items-center w-full">
                  {/* Glowing circular artwork ring (from reference image) */}
                  <div className="relative flex items-center justify-center my-2">
                    <motion.div
                      animate={{
                        scale: isPlaying ? [1, 1.06, 1] : 1,
                        opacity: isPlaying ? [0.55, 0.85, 0.55] : 0.4,
                      }}
                      transition={{
                        duration: 3.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -inset-4 rounded-full blur-2xl"
                      style={{ background: currentTrack.ambient.glow }}
                    />
                    <div className="p-2 rounded-full liquid-pill shadow-2xl">
                      <TrackArtwork
                        track={currentTrack}
                        className="w-52 h-52 sm:w-60 sm:h-60 shadow-2xl"
                        rounded="full"
                        spinning={isPlaying}
                      />
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="mt-6 text-center px-4 flex flex-col items-center gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      {currentTrack.title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>
              )}

              {view === "lyrics" && (
                <div className="w-full h-full overflow-y-auto no-scrollbar px-3 py-4 space-y-5 text-center">
                  {currentTrack.lyrics.map((line, idx) => {
                    const active = idx === activeLyricIndex;
                    return (
                      <button
                        key={line.time}
                        onClick={() => seek(line.time)}
                        className={`block w-full text-center transition-all duration-300 cursor-pointer ${
                          active
                            ? "text-xl font-bold text-[var(--accent-cyan)] scale-105 drop-shadow-[0_0_12px_rgba(56,189,248,0.55)]"
                            : "text-base text-[var(--text-secondary)]/65 hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {line.text}
                      </button>
                    );
                  })}
                </div>
              )}

              {view === "queue" && (
                <div className="w-full h-full overflow-y-auto no-scrollbar space-y-2.5 px-1 py-2">
                  {queue.map((track) => {
                    const active = track.id === currentTrack.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          playTrack(track);
                          recordPlayed(track.id);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-full transition-all text-left cursor-pointer ${
                          active
                            ? "ocean-gradient-btn"
                            : "liquid-pill hover:bg-[var(--glass-bg-hover)]"
                        }`}
                      >
                        <TrackArtwork
                          track={track}
                          className="w-10 h-10"
                          rounded="full"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${
                              active
                                ? "text-white"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            {track.title}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              active
                                ? "text-sky-100"
                                : "text-[var(--text-secondary)]"
                            }`}
                          >
                            {track.artist}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-mono pr-2 ${
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

            {/* Bottom Liquid Glass Control Sheet (matches reference image) */}
            <div className="liquid-glass rounded-[32px] p-5 flex flex-col gap-4 z-10">
              {/* Mini mode tabs + shuffle/repeat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setView("player")}
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      view === "queue"
                        ? "ocean-gradient-btn"
                        : "liquid-pill text-[var(--text-secondary)]"
                    }`}
                  >
                    <ListMusic className="w-3.5 h-3.5" />
                    Queue
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleShuffle}
                    className={`p-1.5 cursor-pointer ${
                      isShuffle
                        ? "text-[var(--accent-cyan)]"
                        : "text-[var(--text-muted)]"
                    }`}
                    aria-label="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cycleRepeat}
                    className={`p-1.5 cursor-pointer ${
                      repeatMode !== "off"
                        ? "text-[var(--accent-cyan)]"
                        : "text-[var(--text-muted)]"
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
              </div>

              {/* Volume row (top of glass sheet, matching reference image) */}
              <div className="flex items-center justify-center gap-3 px-4">
                <button
                  onClick={toggleMute}
                  className="text-[var(--text-secondary)] cursor-pointer"
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
                  className="w-36 accent-sky-400 cursor-pointer h-1.5 rounded-full"
                  aria-label="Volume slider"
                />
                <Volume2 className="w-4 h-4 text-[var(--text-secondary)]" />
              </div>

              {/* Transport controls: Prev, -10s, Glowing Play/Pause, +10s, Next */}
              <div className="flex items-center justify-between px-2">
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
                  className="w-16 h-16 rounded-full ocean-gradient-btn flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-white text-white" />
                  ) : (
                    <Play className="w-7 h-7 fill-white text-white ml-1" />
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
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-mono text-[var(--text-secondary)] w-10">
                  {formatDuration(currentTime)}
                </span>
                <WaveformSeekbar
                  waveform={currentTrack.waveform}
                  progress={progress}
                  onSeek={(ratio) =>
                    seek(Math.round(ratio * currentTrack.duration))
                  }
                  height={40}
                />
                <span className="text-[11px] font-mono text-[var(--text-secondary)] w-10 text-right">
                  {formatDuration(currentTrack.duration)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
