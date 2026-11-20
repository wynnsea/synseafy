"use client";

import React from "react";
import { Heart, Play, Pause, ListPlus } from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { formatDuration } from "@/src/application/use-cases/format-time";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";

interface TrackPillRowProps {
  track: Track;
  queueContext?: Track[];
  extraAction?: React.ReactNode;
}

export function TrackPillRow({
  track,
  queueContext,
  extraAction,
}: TrackPillRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } =
    usePlayerStore();
  const { likedTrackIds, toggleLike, recordPlayed } = useLibraryStore();

  const isCurrent = currentTrack.id === track.id;
  const liked = likedTrackIds.includes(track.id);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
      recordPlayed(track.id);
    }
  };

  return (
    <div
      className={`group liquid-glass rounded-full p-2 pr-3.5 flex items-center gap-3.5 transition-all duration-300 hover:bg-[var(--glass-bg-hover)] ${
        isCurrent ? "ring-1 ring-[var(--accent-cyan)]/60" : ""
      }`}
    >
      {/* Circular Thumbnail with Play overlay (matches reference image) */}
      <button
        onClick={handlePlay}
        className="relative shrink-0 cursor-pointer"
        aria-label={`Play ${track.title}`}
      >
        <TrackArtwork
          track={track}
          className="w-12 h-12 ring-2 ring-white/15"
          rounded="full"
          spinning={isCurrent && isPlaying}
        />
        <span
          className={`absolute inset-0 rounded-full bg-black/35 flex items-center justify-center transition-opacity ${
            isCurrent
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-white text-white" />
          ) : (
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          )}
        </span>
      </button>

      {/* Track Metadata */}
      <button
        onClick={handlePlay}
        className="min-w-0 flex-1 text-left cursor-pointer"
      >
        <p
          className={`text-sm font-semibold truncate ${
            isCurrent
              ? "text-[var(--accent-cyan)]"
              : "text-[var(--text-primary)]"
          }`}
        >
          {track.title}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {track.artist} · {track.album}
        </p>
      </button>

      {/* Duration on larger screens */}
      <span className="hidden sm:inline-block text-xs font-mono text-[var(--text-muted)]">
        {formatDuration(track.duration)}
      </span>

      {/* Quick Add to Queue */}
      <button
        onClick={() => addToQueue(track)}
        title="Add to Up Next"
        className="hidden sm:flex w-8 h-8 rounded-full liquid-pill items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
      >
        <ListPlus className="w-4 h-4" />
      </button>

      {extraAction}

      {/* Circular Glass Heart Button (matches reference image) */}
      <button
        onClick={() => toggleLike(track.id)}
        aria-label={liked ? "Unlike" : "Like"}
        className={`w-10 h-10 rounded-full liquid-pill flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          liked
            ? "text-sky-400"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
