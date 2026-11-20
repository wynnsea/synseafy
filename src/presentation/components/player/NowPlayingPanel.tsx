"use client";

import React from "react";
import { Reorder } from "framer-motion";
import { X, GripVertical, Trash2, Mic2, ListMusic } from "lucide-react";
import type { DrawerTab } from "@/src/application/stores/use-ui-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";

type Tab = Exclude<DrawerTab, null>;

interface NowPlayingPanelProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  /** Shown as an X button when the panel can be dismissed (the drawer). */
  onClose?: () => void;
}

/**
 * Lyrics + Up Next queue for the current song. Used in the right column on
 * wide desktops and in the slide-over drawer on smaller screens.
 */
export function NowPlayingPanel({ tab, onTabChange, onClose }: NowPlayingPanelProps) {
  const { currentTrack, currentTime, queue, seek, playTrack, setQueue, removeFromQueue } =
    usePlayerStore();
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);

  const activeLyricIndex = currentTrack.lyrics.reduce(
    (acc, line, idx) => (currentTime >= line.time ? idx : acc),
    0
  );

  const tabClass = (t: Tab) =>
    `px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
      tab === t
        ? "ocean-gradient-btn"
        : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      {/* Header: tabs (+ close in the drawer) */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onTabChange("lyrics")} className={tabClass("lyrics")}>
            <Mic2 className="w-3.5 h-3.5" />
            Lyrics
          </button>
          <button onClick={() => onTabChange("queue")} className={tabClass("queue")}>
            <ListMusic className="w-3.5 h-3.5" />
            Up Next
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {tab === "lyrics" ? (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 px-2.5 -mx-2.5 py-2">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl liquid-pill">
            <TrackArtwork track={currentTrack} className="w-11 h-11" rounded="full" />
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
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 -mx-3 py-2">
          <p className="text-[11px] text-[var(--text-muted)] px-1 pb-2.5">
            Drag tracks to reorder queue
          </p>
          <Reorder.Group axis="y" values={queue} onReorder={setQueue} className="space-y-2.5 pb-4">
            {queue.map((track) => {
              const active = track.id === currentTrack.id;
              return (
                <Reorder.Item
                  key={track.id}
                  value={track}
                  whileDrag={{ scale: 1.02, zIndex: 20 }}
                  className={`group flex items-center gap-2 p-2 rounded-2xl transition-colors cursor-grab active:cursor-grabbing select-none ${
                    active ? "ocean-gradient-btn" : "liquid-pill hover:bg-[var(--glass-bg-hover)]"
                  }`}
                >
                  <GripVertical
                    className={`w-4 h-4 shrink-0 ${active ? "text-white/75" : "text-[var(--text-muted)]"}`}
                  />

                  <button
                    onClick={() => {
                      playTrack(track);
                      recordPlayed(track.id);
                    }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <TrackArtwork track={track} className="w-9 h-9" rounded="full" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          active ? "text-white" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p
                        className={`text-[11px] truncate ${
                          active ? "text-sky-100" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {track.artist}
                      </p>
                    </div>
                  </button>

                  {!active && (
                    <button
                      onClick={() => removeFromQueue(track.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
