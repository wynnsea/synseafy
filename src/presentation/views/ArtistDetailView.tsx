"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Shuffle, BadgeCheck, Disc3 } from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { useSlugTracks } from "@/src/application/hooks/use-slug-tracks";
import { toSlug } from "@/src/application/use-cases/slugify";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";

export function ArtistDetailView({ slug }: { slug: string }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const { playTrack, toggleShuffle, isShuffle } = usePlayerStore();
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);
  const showToast = useToastStore((s) => s.showToast);

  const { tracks: artistTracks, loading } = useSlugTracks("artist", slug);

  const primaryTrack = artistTracks[0];
  // The exact artist (not the joined "A, B" credit) whose slug is in the URL
  const artistName =
    (primaryTrack?.artists ?? [primaryTrack?.artist]).find((a) => a && toSlug(a) === slug) ??
    primaryTrack?.artist ??
    "Artist";

  const albums = useMemo(() => {
    const map = new Map<string, Track>();
    artistTracks.forEach((t) => {
      if (t.album && !map.has(t.album)) map.set(t.album, t);
    });
    return Array.from(map.values());
  }, [artistTracks]);

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-7 py-12 space-y-4">
        <div className="liquid-glass-strong rounded-[32px] h-40 animate-pulse" />
        <div className="liquid-glass rounded-[28px] h-64 animate-pulse" />
      </div>
    );
  }

  if (!primaryTrack) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-7 py-12">
        <div className="liquid-glass rounded-[32px] p-10 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Artist not found
          </p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader title={artistName} subtitle="Verified Ocean Artist" />

      <div className="px-4 md:px-7 space-y-6 pb-6">
        <button
          onClick={() => router.back()}
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-full liquid-pill text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Spotify-style Artist Hero Banner */}
        <div className="liquid-glass-strong rounded-[34px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <TrackArtwork
              track={primaryTrack}
              className="w-24 h-24 sm:w-28 sm:h-28 ring-2 ring-white/30 shadow-2xl"
              rounded="full"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-cyan)]">
                <BadgeCheck className="w-4 h-4" />
                Verified Artist
              </span>
              <h2 className="text-xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
                {artistName}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                {primaryTrack.playCount
                  ? `${primaryTrack.playCount} monthly listeners${primaryTrack.genre ? ` · ${primaryTrack.genre}` : ""}`
                  : `${artistTracks.length} songs on YouTube Music`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => {
                playTrack(artistTracks[0], artistTracks);
                recordPlayed(artistTracks[0].id);
              }}
              className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Play
            </button>

            <button
              onClick={() => {
                if (!isShuffle) toggleShuffle();
                playTrack(artistTracks[0], artistTracks);
                recordPlayed(artistTracks[0].id);
                showToast(`Shuffling ${artistName}`);
              }}
              className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--accent-cyan)] cursor-pointer"
              title="Shuffle Artist"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const next = !following;
                setFollowing(next);
                showToast(
                  next ? `Following ${artistName}` : `Unfollowed ${artistName}`
                );
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                following
                  ? "ocean-gradient-btn"
                  : "liquid-pill text-[var(--text-primary)]"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* Popular Tracks */}
        <section className="space-y-3">
          <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
            Popular Tracks
          </h3>
          <div className="space-y-2.5">
            {artistTracks.map((track) => (
              <TrackPillRow
                key={track.id}
                track={track}
                queueContext={artistTracks}
              />
            ))}
          </div>
        </section>

        {/* Discography / Albums */}
        <section className="space-y-3">
          <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-[var(--accent-cyan)]" />
            Albums &amp; Releases
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {albums.map((track) => (
              <Link
                key={track.album}
                href={`/album/${toSlug(track.album)}`}
                className="group liquid-glass rounded-[26px] p-3.5 space-y-3 hover:-translate-y-1 transition-transform"
              >
                <div className="aspect-square w-full overflow-hidden rounded-2xl">
                  <TrackArtwork
                    track={track}
                    className="w-full h-full"
                    rounded="2xl"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)]">
                    {track.album}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {track.genre ? `Album · ${track.genre}` : "Album"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
