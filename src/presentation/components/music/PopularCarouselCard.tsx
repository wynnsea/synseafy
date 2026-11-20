"use client";

import React from "react";
import { Heart, Play, Pause } from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";

interface PopularCarouselCardProps {
  track: Track;
  queueContext?: Track[];
}

export function PopularCarouselCard({
  track,
  queueContext,
}: PopularCarouselCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
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
    <div className="group relative w-[205px] sm:w-[225px] shrink-0 rounded-[28px] liquid-glass overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      {/* Top Square Artwork */}
      <div
        onClick={handlePlay}
        className="relative p-2.5 pb-0 cursor-pointer"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[22px]">
          <TrackArtwork track={track} className="w-full h-full" rounded="2xl" />

          {/* Floating Play/Pause glass badge */}
          <div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
              isCurrent
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="w-12 h-12 rounded-full ocean-gradient-btn flex items-center justify-center shadow-xl">
              {isCurrent && isPlaying ? (
                <Pause className="w-5 h-5 fill-white text-white" />
              ) : (
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              )}
            </div>
          </div>

          {/* Genre pill badge */}
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/35 text-white backdrop-blur-md border border-white/15">
            {track.genre}
          </span>
        </div>
      </div>

      {/* Bottom Frosted Info Strip (matches reference image) */}
      <div className="p-3.5 pt-3 flex items-center justify-between gap-2">
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
          <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
            {track.artist} · {track.songCountLabel ?? track.playCount}
          </p>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track.id);
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
      </div>
    </div>
  );
}
