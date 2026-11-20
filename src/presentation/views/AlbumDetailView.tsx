"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { toSlug } from "@/src/application/use-cases/slugify";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { formatDuration } from "@/src/application/use-cases/format-time";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";

export function AlbumDetailView({ slug }: { slug: string }) {
  const router = useRouter();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);

  const albumTracks = useMemo(
    () => MOCK_TRACKS.filter((t) => toSlug(t.album) === slug),
    [slug]
  );

  const primary = albumTracks[0];
  const totalDuration = albumTracks.reduce((sum, t) => sum + t.duration, 0);

  if (!primary) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-7 py-12">
        <div className="liquid-glass rounded-[32px] p-10 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Album not found
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
      <TopHeader title={primary.album} subtitle={`Album by ${primary.artist}`} />

      <div className="px-4 md:px-7 space-y-6 pb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full liquid-pill text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="liquid-glass-strong rounded-[34px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <TrackArtwork
              track={primary}
              className="w-24 h-24 sm:w-28 sm:h-28 shadow-2xl ring-2 ring-white/25"
              rounded="2xl"
            />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-cyan)]">
                Album · {primary.genre}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                {primary.album}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                <Link
                  href={`/artist/${toSlug(primary.artist)}`}
                  className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-cyan)] hover:underline"
                >
                  {primary.artist}
                </Link>{" "}
                · {albumTracks.length} track{albumTracks.length > 1 ? "s" : ""} ·{" "}
                {formatDuration(totalDuration)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTrack(albumTracks[0], albumTracks);
              recordPlayed(albumTracks[0].id);
            }}
            className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2 self-start sm:self-center cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Play Album
          </button>
        </div>

        <div className="space-y-2.5">
          {albumTracks.map((track) => (
            <TrackPillRow
              key={track.id}
              track={track}
              queueContext={albumTracks}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
