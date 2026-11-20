"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Clock, WifiOff, RotateCw } from "lucide-react";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useCatalogStore } from "@/src/application/stores/use-catalog-store";
import { useMoodTracks } from "@/src/application/hooks/use-mood-tracks";
import { resolveTracks } from "@/src/infrastructure/data/catalog";
import { musicRepository } from "@/src/infrastructure/repositories/music-repository";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { GenreChips } from "@/src/presentation/components/music/GenreChips";
import { PopularCarouselCard } from "@/src/presentation/components/music/PopularCarouselCard";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { QuickPickGrid } from "@/src/presentation/components/music/QuickPickGrid";

const GENRES = musicRepository.getGenres();
const MOBILE_TRENDING_LIMIT = 5;

export function HomeView() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const recentTrackIds = useLibraryStore((s) => s.recentTrackIds);
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const { home, homeStatus, homeError, loadHome } = useCatalogStore();
  const mood = useMoodTracks(selectedGenre);

  // A mood chip swaps both sections for that mood's songs
  const moodActive = selectedGenre !== "All";
  const popularTracks = moodActive
    ? mood.tracks.slice(0, 12)
    : (home?.quickPicks ?? []);
  const trendingTracks = moodActive
    ? mood.tracks.slice(12)
    : (home?.trending ?? []);
  const loading = moodActive
    ? mood.loading
    : homeStatus === "loading" || homeStatus === "idle";
  const error = moodActive
    ? mood.error
    : homeStatus === "error"
      ? homeError
      : null;

  const recentTracks = useMemo(
    () => resolveTracks(recentTrackIds),
    [recentTrackIds],
  );

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
        <QuickPickGrid suggestions={home?.quickPicks ?? []} />

        {error && (
          <section className="liquid-glass rounded-[28px] p-6 flex flex-col items-center text-center gap-3">
            <WifiOff className="w-8 h-8 text-[var(--accent-cyan)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Couldn&apos;t load music right now
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{error}</p>
            {!moodActive && (
              <button
                onClick={loadHome}
                className="px-4 py-2 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Try again
              </button>
            )}
          </section>
        )}

        {/* Popular Horizontal Carousel (matches reference image) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {moodActive ? selectedGenre : "Quick Picks"}
            </h2>
            <Link
              href="/search"
              className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-3 -my-2 -mx-4 px-4 md:-mx-2 md:px-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="liquid-glass rounded-[30px] w-[220px] h-[270px] shrink-0 animate-pulse"
                  />
                ))
              : popularTracks.map((track) => (
                  <PopularCarouselCard
                    key={track.id}
                    track={track}
                    queueContext={popularTracks}
                  />
                ))}
          </div>
        </section>

        {/* Hot & Trending Pill List (matches reference image) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {moodActive ? `More ${selectedGenre}` : "Hot & Trending"}
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
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="liquid-glass rounded-full h-[68px] animate-pulse"
                />
              ))}
            {!loading &&
              trendingTracks.map((track, idx) => (
                // Phones get a short list; the rest is one tap away via "See All"
                <div
                  key={track.id}
                  className={
                    idx >= MOBILE_TRENDING_LIMIT ? "hidden md:block" : ""
                  }
                >
                  <TrackPillRow track={track} queueContext={trendingTracks} />
                </div>
              ))}
          </div>
        </section>

        {/* Recently Played Section */}
        {recentTracks.length > 0 && (
          <section className="space-y-3.5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h2 className="text-base md:text-lg font-bold tracking-tight text-[var(--text-primary)]">
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

            {/* Full-bleed row like the category chips: scrolls to the screen edge,
                with vertical room so the glass shadows aren't clipped */}
            <div className="-mx-4 md:-mx-7 -my-2 overflow-x-auto no-scrollbar">
              <div className="flex w-max items-center gap-3 px-4 md:px-7 py-2">
                {recentTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      // Start a radio from this song instead of replaying your history
                      playTrack(track, [track]);
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
