"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  Clock,
  Disc3,
  ChevronDown,
  Check,
} from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { GENRES, MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { musicRepository } from "@/src/infrastructure/repositories/mock-music-repository";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useSearchStore } from "@/src/application/stores/use-search-store";
import { toSlug } from "@/src/application/use-cases/slugify";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { PlaylistCard } from "@/src/presentation/components/music/PlaylistCard";

type SearchTab = "all" | "songs" | "artists" | "albums" | "playlists";

const BROWSE_TILES = [
  {
    genre: "Ocean Chill",
    subtitle: "Deep ambient & waves",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
  },
  {
    genre: "Pop",
    subtitle: "Chart-topping hits",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
  },
  {
    genre: "Lo-Fi",
    subtitle: "Late night study beats",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
  },
  {
    genre: "R&B",
    subtitle: "Smooth coastal vocals",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #4f46e5 100%)",
  },
  {
    genre: "Indie",
    subtitle: "Dreamy sunlit guitars",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #0284c7 100%)",
  },
  {
    genre: "Synthwave",
    subtitle: "Neon midnight pulse",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1e1b4b 100%)",
  },
];

export function SearchView() {
  // Shared with the header search box, so a query typed there lands here
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [results, setResults] = useState<Track[]>(MOCK_TRACKS);
  const [settledKey, setSettledKey] = useState(":All");
  const genreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!genreMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (
        genreMenuRef.current &&
        !genreMenuRef.current.contains(e.target as Node)
      ) {
        setGenreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [genreMenuOpen]);

  const playlists = useLibraryStore((s) => s.playlists);
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchStore();

  const currentKey = `${query}:${selectedGenre}`;
  const isSearching = settledKey !== currentKey;
  const hasFilter = query.trim().length > 0 || selectedGenre !== "All";

  // Debounced search (350ms per PRD specification)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const data = await musicRepository.searchTracks(query, selectedGenre);
      setResults(data);
      setSettledKey(`${query}:${selectedGenre}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedGenre]);

  const matchingArtists = useMemo(() => {
    const seen = new Map<string, Track>();
    results.forEach((t) => {
      if (!seen.has(t.artist)) seen.set(t.artist, t);
    });
    return Array.from(seen.values());
  }, [results]);

  const matchingAlbums = useMemo(() => {
    const seen = new Map<string, Track>();
    results.forEach((t) => {
      if (!seen.has(t.album)) seen.set(t.album, t);
    });
    return Array.from(seen.values());
  }, [results]);

  const matchingPlaylists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter(
      (pl) =>
        pl.name.toLowerCase().includes(q) ||
        pl.description.toLowerCase().includes(q),
    );
  }, [playlists, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) addRecentSearch(query.trim());
  };

  // Like Spotify: a search counts as "recent" once you pick something from its
  // results (play a song, open an artist/album/playlist), not just on Enter.
  const rememberQuery = () => {
    if (query.trim()) addRecentSearch(query.trim());
  };

  const tabs: { id: SearchTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "songs", label: `Songs (${results.length})` },
    { id: "artists", label: `Artists (${matchingArtists.length})` },
    { id: "albums", label: `Albums (${matchingAlbums.length})` },
    { id: "playlists", label: `Playlists (${matchingPlaylists.length})` },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Discovery & Search"
        subtitle="Search songs, artists, albums & ocean moods"
      />

      <div className="px-4 md:px-7 space-y-6 pb-6">
        {/* Liquid Glass Search Input */}
        <form onSubmit={handleSubmit} className="relative">
          <Search className="w-5 h-5 text-[var(--accent-cyan)] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full liquid-glass-strong rounded-full pl-13 pr-12 py-4 text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60 transition-all"
          />
          {(query || selectedGenre !== "All") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedGenre("All");
                setActiveTab("all");
              }}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Empty state: Recent Searches + Spotify-style Browse Moods & Genres */}
        {!hasFilter ? (
          <div className="space-y-7">
            {recentSearches.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--accent-cyan)]" />
                    Recent Searches
                  </h2>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent-cyan)] cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="liquid-pill rounded-full pl-3.5 pr-2 py-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]"
                    >
                      <button
                        onClick={() => setQuery(term)}
                        className="hover:text-[var(--accent-cyan)] cursor-pointer"
                      >
                        {term}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(term)}
                        aria-label={`Remove ${term}`}
                        className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Browse All Moods & Genres Tiles */}
            <section className="space-y-3.5">
              <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
                Browse Ocean Moods &amp; Genres
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {BROWSE_TILES.map((tile) => (
                  <button
                    key={tile.genre}
                    onClick={() => {
                      setSelectedGenre(tile.genre);
                      addRecentSearch(tile.genre);
                    }}
                    className="group relative h-28 sm:h-32 rounded-[26px] p-4 text-left overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-pointer border border-white/25"
                    style={{ background: tile.gradient }}
                  >
                    <div
                      className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/20 blur-xl group-hover:scale-125 transition-transform"
                      aria-hidden
                    />
                    <Disc3 className="w-14 h-14 text-white/20 absolute right-3 bottom-2 rotate-12 group-hover:rotate-45 transition-transform" />
                    <p className="relative z-10 text-base sm:text-lg font-bold text-white">
                      {tile.genre}
                    </p>
                    <p className="relative z-10 text-[11px] text-sky-100/90 mt-0.5">
                      {tile.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Active Search / Genre Filtered Results with Spotify Tabs */
          <div className="space-y-6">
            {/* Genre quick pills + Result Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "ocean-gradient-btn"
                        : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {selectedGenre !== "All" && (
                <div
                  ref={genreMenuRef}
                  className="relative flex items-center gap-2"
                >
                  <span className="text-xs text-[var(--text-muted)]">
                    Genre:
                  </span>
                  <button
                    type="button"
                    onClick={() => setGenreMenuOpen((v) => !v)}
                    className="liquid-pill rounded-full px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
                  >
                    <span>{selectedGenre}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--accent-cyan)] transition-transform duration-200 ${
                        genreMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {genreMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{
                          duration: 0.16,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute right-0 top-10 w-44 liquid-glass-dock rounded-2xl p-1.5 z-40 shadow-2xl space-y-0.5"
                      >
                        {GENRES.map((g) => {
                          const isSelected = g === selectedGenre;
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                setSelectedGenre(g);
                                setGenreMenuOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "ocean-gradient-btn"
                                  : "text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
                              }`}
                            >
                              <span>{g}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {isSearching && (
              <p className="text-xs font-semibold text-[var(--accent-cyan)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Searching ocean catalog...
              </p>
            )}

            {/* Results: any click/tap in here remembers the query */}
            <div onClickCapture={rememberQuery} className="space-y-6">
              {/* Songs Section */}
              {(activeTab === "all" || activeTab === "songs") && (
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Songs
                  </h3>
                  {results.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {results.map((track) => (
                        <TrackPillRow
                          key={track.id}
                          track={track}
                          queueContext={results}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">
                      No songs matched your search.
                    </p>
                  )}
                </section>
              )}

              {/* Artists Section */}
              {(activeTab === "all" || activeTab === "artists") &&
                matchingArtists.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Artists
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                      {matchingArtists.map((track) => (
                        <Link
                          key={track.artist}
                          href={`/artist/${toSlug(track.artist)}`}
                          className="group liquid-glass rounded-[26px] p-4 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform"
                        >
                          <TrackArtwork
                            track={track}
                            className="w-20 h-20 ring-2 ring-white/25 shadow-lg"
                            rounded="full"
                          />
                          <div className="min-w-0 w-full">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)]">
                              {track.artist}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">
                              Artist
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {/* Albums Section */}
              {(activeTab === "all" || activeTab === "albums") &&
                matchingAlbums.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Albums
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                      {matchingAlbums.map((track) => (
                        <Link
                          key={track.album}
                          href={`/album/${toSlug(track.album)}`}
                          className="group liquid-glass rounded-[26px] p-3.5 space-y-2.5 hover:-translate-y-1 transition-transform"
                        >
                          <div className="aspect-square w-full overflow-hidden rounded-2xl">
                            <TrackArtwork
                              track={track}
                              className="w-full h-full"
                              rounded="2xl"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)]">
                              {track.album}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate">
                              {track.artist}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {/* Playlists Section */}
              {(activeTab === "all" || activeTab === "playlists") &&
                matchingPlaylists.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Playlists
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchingPlaylists.map((pl) => (
                        <PlaylistCard key={pl.id} playlist={pl} />
                      ))}
                    </div>
                  </section>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
