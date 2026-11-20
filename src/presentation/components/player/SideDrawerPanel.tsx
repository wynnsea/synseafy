"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUp, ArrowDown, Trash2, Mic2, ListMusic } from "lucide-react";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";

/**
 * Desktop 3rd-Pane Liquid Glass Panel (Lyrics & Up Next Queue)
 * Sits cleanly in its own dedicated right flex column on lg+ (zero overlap with
 * main content!) and uses an opaque-frosted backdrop scrim on medium tablets.
 */
export function SideDrawerPanel() {
  const { activeDrawer, setActiveDrawer } = useUiStore();
  const {
    currentTrack,
    currentTime,
    queue,
    seek,
    playTrack,
    moveQueueItem,
    removeFromQueue,
  } = usePlayerStore();
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);

  const activeLyricIndex = currentTrack.lyrics.reduce((acc, line, idx) => {
    return currentTime >= line.time ? idx : acc;
  }, 0);

  return (
    <AnimatePresence>
      {activeDrawer && (
        <>
          {/* Medium-screen backdrop scrim so panel never collides visually with main content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDrawer(null)}
            className="hidden md:block lg:hidden fixed inset-0 z-30 bg-[var(--bg-canvas)]/65 backdrop-blur-md"
          />

          <motion.aside
            initial={{ opacity: 0, x: 32, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 348 }}
            exit={{ opacity: 0, x: 32, width: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="hidden md:flex fixed lg:static top-4 right-4 bottom-[106px] lg:top-auto lg:right-auto lg:bottom-auto lg:h-screen lg:p-4 lg:pl-1 z-40 lg:z-20 shrink-0 overflow-hidden"
          >
            <div className="w-full h-full liquid-glass-dock lg:liquid-glass-strong rounded-[30px] p-4 flex flex-col gap-4 overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveDrawer("lyrics")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeDrawer === "lyrics"
                        ? "ocean-gradient-btn"
                        : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Mic2 className="w-3.5 h-3.5" />
                    Lyrics
                  </button>
                  <button
                    onClick={() => setActiveDrawer("queue")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeDrawer === "queue"
                        ? "ocean-gradient-btn"
                        : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <ListMusic className="w-3.5 h-3.5" />
                    Up Next
                  </button>
                </div>

                <button
                  onClick={() => setActiveDrawer(null)}
                  aria-label="Close panel"
                  className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Body */}
              {activeDrawer === "lyrics" ? (
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 pr-1">
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl liquid-pill">
                    <TrackArtwork
                      track={currentTrack}
                      className="w-11 h-11"
                      rounded="full"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-[var(--text-primary)]">
                        {currentTrack.title}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {currentTrack.artist}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 py-2 px-1">
                    {currentTrack.lyrics.map((line, idx) => {
                      const active = idx === activeLyricIndex;
                      return (
                        <button
                          key={line.time}
                          onClick={() => seek(line.time)}
                          className={`block text-left w-full transition-all duration-300 cursor-pointer ${
                            active
                              ? "text-lg font-bold text-[var(--accent-cyan)] drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]"
                              : "text-sm text-[var(--text-secondary)]/80 hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {line.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {queue.map((track, index) => {
                    const active = track.id === currentTrack.id;
                    return (
                      <div
                        key={track.id}
                        className={`group flex items-center gap-2.5 p-2 rounded-2xl transition-all ${
                          active
                            ? "ocean-gradient-btn"
                            : "liquid-pill hover:bg-[var(--glass-bg-hover)]"
                        }`}
                      >
                        <button
                          onClick={() => {
                            playTrack(track);
                            recordPlayed(track.id);
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                        >
                          <TrackArtwork
                            track={track}
                            className="w-9 h-9"
                            rounded="full"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-semibold truncate ${
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
                        </button>

                        <div className="flex items-center gap-0.5 opacity-85">
                          <button
                            onClick={() => moveQueueItem(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 disabled:opacity-30 cursor-pointer"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveQueueItem(index, index + 1)}
                            disabled={index === queue.length - 1}
                            className="p-1 disabled:opacity-30 cursor-pointer"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          {!active && (
                            <button
                              onClick={() => removeFromQueue(track.id)}
                              className="p-1 hover:text-rose-400 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
