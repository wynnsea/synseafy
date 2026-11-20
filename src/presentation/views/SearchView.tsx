"use client";

import React, { useEffect, useState } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { GENRES, MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { musicRepository } from "@/src/infrastructure/repositories/mock-music-repository";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { GenreChips } from "@/src/presentation/components/music/GenreChips";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [results, setResults] = useState<Track[]>(MOCK_TRACKS);
  const [settledKey, setSettledKey] = useState(":All");

  const currentKey = `${query}:${selectedGenre}`;
  const isSearching = settledKey !== currentKey;

  // Debounced search (350ms per PRD specification)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const data = await musicRepository.searchTracks(query, selectedGenre);
      setResults(data);
      setSettledKey(`${query}:${selectedGenre}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedGenre]);

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Discovery & Search"
        subtitle="Search songs, artists, albums & ocean moods"
      />

      <div className="px-4 md:px-7 space-y-6">
        {/* Liquid Glass Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-[var(--accent-cyan)] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists, or albums..."
            className="w-full liquid-glass-strong rounded-full pl-13 pr-12 py-4 text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Genre Chips */}
        <GenreChips
          genres={GENRES}
          selected={selectedGenre}
          onSelect={setSelectedGenre}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
            {isSearching
              ? "Searching ocean catalog..."
              : `${results.length} track${results.length === 1 ? "" : "s"} found`}
          </p>
        </div>

        {/* Results List */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
            {results.map((track) => (
              <TrackPillRow
                key={track.id}
                track={track}
                queueContext={results}
              />
            ))}
          </div>
        ) : (
          <div className="liquid-glass rounded-[32px] p-10 text-center space-y-2">
            <p className="text-base font-semibold text-[var(--text-primary)]">
              No tracks matched &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Try another keyword or reset the genre filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
