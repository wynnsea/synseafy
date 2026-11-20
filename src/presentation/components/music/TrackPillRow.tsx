"use client";

import React from "react";
import Link from "next/link";
import { Heart, Play, Pause } from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { formatDuration } from "@/src/application/use-cases/format-time";
import { toSlug } from "@/src/application/use-cases/slugify";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { EqualizerBars } from "@/src/presentation/components/music/EqualizerBars";
import { TrackContextMenu } from "@/src/presentation/components/music/TrackContextMenu";

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
  const { hasActiveTrack, currentTrack, isPlaying, playTrack, togglePlay } =
    usePlayerStore();
  const { likedTrackIds, toggleLike, recordPlayed } = useLibraryStore();
  const showToast = useToastStore((s) => s.showToast);

  const isCurrent = hasActiveTrack && currentTrack.id === track.id;
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
      className={`group liquid-glass rounded-full p-2 pr-3 flex items-center gap-3 transition-all duration-300 hover:bg-[var(--glass-bg-hover)] ${
        isCurrent ? "ring-1 ring-[var(--accent-cyan)]/60" : ""
      }`}
    >
      {/* Circular Thumbnail with Play overlay */}
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

      {/* Track Metadata with animated Equalizer & clickable Artist/Album */}
      <div className="min-w-0 flex-1">
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 max-w-full text-left cursor-pointer"
        >
          {isCurrent && <EqualizerBars active={isPlaying} />}
          <span
            className={`text-sm font-semibold truncate ${
              isCurrent
                ? "text-[var(--accent-cyan)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            {track.title}
          </span>
        </button>

        <p className="text-xs text-[var(--text-secondary)] truncate">
          <Link
            href={`/artist/${toSlug(track.artist)}`}
            className="hover:text-[var(--accent-cyan)] hover:underline"
          >
            {track.artist}
          </Link>
          <span className="mx-1.5 opacity-60">·</span>
          <Link
            href={`/album/${toSlug(track.album)}`}
            className="hover:text-[var(--accent-cyan)] hover:underline"
          >
            {track.album}
          </Link>
        </p>
      </div>

      {/* Duration on larger screens */}
      <span className="hidden sm:inline-block text-xs font-mono text-[var(--text-muted)]">
        {formatDuration(track.duration)}
      </span>

      {extraAction}

      {/* Circular Glass Heart Button */}
      <button
        onClick={() => {
          toggleLike(track.id);
          showToast(
            liked
              ? `Removed "${track.title}" from Liked`
              : `Saved "${track.title}" to Liked Songs`
          );
        }}
        aria-label={liked ? "Unlike" : "Like"}
        className={`w-9 h-9 rounded-full liquid-pill flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          liked
            ? "text-sky-400"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      </button>

      {/* Spotify-style Context Menu (...) */}
      <TrackContextMenu track={track} />
    </div>
  );
}
