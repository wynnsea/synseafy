"use client";

import React from "react";
import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";

/**
 * Spotify-style 2x3 Quick-Pick Grid right at the top of Home
 * Instant 1-tap access to Liked Songs, custom playlists, and top recent picks.
 */
export function QuickPickGrid() {
  const { playlists, likedTrackIds, recordPlayed } = useLibraryStore();
  const playTrack = usePlayerStore((s) => s.playTrack);

  const likedTracks = likedTrackIds
    .map((id) => MOCK_TRACKS.find((t) => t.id === id))
    .filter((t): t is (typeof MOCK_TRACKS)[number] => Boolean(t));

  const quickPlaylists = playlists.slice(0, 3);
  const quickTracks = MOCK_TRACKS.slice(0, Math.max(0, 5 - quickPlaylists.length));

  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
      {/* Tile 1: Liked Songs */}
      <Link
        href="/liked"
        className="group liquid-glass rounded-2xl p-2 pr-3 flex items-center gap-3 hover:bg-[var(--glass-bg-hover)] transition-all overflow-hidden"
      >
        <div className="w-12 h-12 rounded-xl ocean-gradient-btn flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 fill-white text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
            Liked Songs
          </p>
          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {likedTracks.length} saved
          </p>
        </div>
        {likedTracks.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              playTrack(likedTracks[0], likedTracks);
              recordPlayed(likedTracks[0].id);
            }}
            aria-label="Play Liked Songs"
            className="hidden sm:flex w-8 h-8 rounded-full ocean-gradient-btn items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
          </button>
        )}
      </Link>

      {/* Tiles 2-4: Custom Playlists */}
      {quickPlaylists.map((pl) => {
        const plTracks = pl.trackIds
          .map((id) => MOCK_TRACKS.find((t) => t.id === id))
          .filter((t): t is (typeof MOCK_TRACKS)[number] => Boolean(t));

        return (
          <Link
            key={pl.id}
            href={`/playlist/${pl.id}`}
            className="group liquid-glass rounded-2xl p-2 pr-3 flex items-center gap-3 hover:bg-[var(--glass-bg-hover)] transition-all overflow-hidden"
          >
            <div
              className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${pl.coverGradient.from}, ${pl.coverGradient.via}, ${pl.coverGradient.to})`,
              }}
            >
              {pl.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                {pl.name}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {pl.trackIds.length} songs
              </p>
            </div>
            {plTracks.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  playTrack(plTracks[0], plTracks);
                  recordPlayed(plTracks[0].id);
                }}
                aria-label={`Play ${pl.name}`}
                className="hidden sm:flex w-8 h-8 rounded-full ocean-gradient-btn items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
              </button>
            )}
          </Link>
        );
      })}

      {/* Remaining Tiles: Quick Tracks */}
      {quickTracks.map((track) => (
        <button
          key={track.id}
          type="button"
          onClick={() => {
            playTrack(track, MOCK_TRACKS);
            recordPlayed(track.id);
          }}
          className="group liquid-glass rounded-2xl p-2 pr-3 flex items-center gap-3 hover:bg-[var(--glass-bg-hover)] transition-all text-left overflow-hidden cursor-pointer"
        >
          <TrackArtwork track={track} className="w-12 h-12" rounded="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
              {track.title}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              {track.artist}
            </p>
          </div>
          <span className="hidden sm:flex w-8 h-8 rounded-full ocean-gradient-btn items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
          </span>
        </button>
      ))}
    </section>
  );
}
