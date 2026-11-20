"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Clock } from "lucide-react";
import { GENRES, MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { GenreChips } from "@/src/presentation/components/music/GenreChips";
import { PopularCarouselCard } from "@/src/presentation/components/music/PopularCarouselCard";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { QuickPickGrid } from "@/src/presentation/components/music/QuickPickGrid";

export function HomeView() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const recentTrackIds = useLibraryStore((s) => s.recentTrackIds);
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const filteredTracks = useMemo(() => {
    if (selectedGenre === "All") return MOCK_TRACKS;
    return MOCK_TRACKS.filter((t) => t.genre === selectedGenre);
  }, [selectedGenre]);

  const popularTracks = useMemo(() => {
    const base = filteredTracks.filter((t) => t.isPopular);
    return base.length > 0 ? base : filteredTracks;
  }, [filteredTracks]);

  const trendingTracks = useMemo(() => {
    const base = filteredTracks.filter((t) => t.isTrending);
    return base.length > 0 ? base : filteredTracks;
  }, [filteredTracks]);

  const recentTracks = useMemo(() => {
    return recentTrackIds
      .map((id) => MOCK_TRACKS.find((t) => t.id === id))
      .filter((t): t is (typeof MOCK_TRACKS)[number] => Boolean(t));
  }, [recentTrackIds]);

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Hi, Wynnsea"
        subtitle="Personal liquid soundscape · YouTube Music ready"
      />

      <div className="px-4 md:px-7 space-y-7">
        {/* Category / Genre Filter Pills (matches reference image) */}
        <section>
          <GenreChips
            genres={GENRES}
            selected={selectedGenre}
            onSelect={setSelectedGenre}
          />
        </section>

        {/* Spotify-style 2x3 Quick-Pick Grid */}
        <QuickPickGrid />

        {/* Popular Horizontal Carousel (matches reference image) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Popular
            </h2>
            <Link
              href="/search"
              className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-3 -my-2 -mx-4 px-4 md:-mx-2 md:px-2">
            {popularTracks.map((track) => (
              <PopularCarouselCard
                key={track.id}
                track={track}
                queueContext={filteredTracks}
              />
            ))}
          </div>
        </section>

        {/* Hot & Trending Pill List (matches reference image) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Hot &amp; Trending
              </h2>
              <Flame className="w-5 h-5 text-sky-400 fill-sky-400/30" />
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {trendingTracks.map((track) => (
              <TrackPillRow
                key={track.id}
                track={track}
                queueContext={trendingTracks}
              />
            ))}
          </div>
        </section>

        {/* Recently Played Section */}
        {recentTracks.length > 0 && (
          <section className="space-y-3.5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  Recently Played
                </h2>
              </div>
              <Link
                href="/liked"
                className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
              >
                History
              </Link>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {recentTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    playTrack(track, recentTracks);
                    recordPlayed(track.id);
                  }}
                  className="liquid-glass rounded-full p-2 pr-4 flex items-center gap-3 shrink-0 hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
                >
                  <TrackArtwork
                    track={track}
                    className="w-10 h-10"
                    rounded="full"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[var(--text-primary)] max-w-[130px] truncate">
                      {track.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] max-w-[130px] truncate">
                      {track.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
