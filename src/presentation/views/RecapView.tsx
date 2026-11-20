"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Flame,
  BarChart3,
  Disc3,
  Play,
  History,
  Trash2,
} from "lucide-react";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { useActivityStore } from "@/src/application/stores/use-activity-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import {
  computeListeningRecap,
  formatRecordTimestamp,
} from "@/src/application/use-cases/compute-recap";
import { formatDuration } from "@/src/application/use-cases/format-time";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { RecapPosterModal } from "@/src/presentation/components/recap/RecapPosterModal";

export function RecapView() {
  const router = useRouter();
  const [posterOpen, setPosterOpen] = useState(false);

  const { records, clearRecords } = useActivityStore();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);
  const showToast = useToastStore((s) => s.showToast);

  const recap = useMemo(
    () => computeListeningRecap(records, MOCK_TRACKS),
    [records]
  );

  const maxBucketPlays = Math.max(
    1,
    ...recap.hourBuckets.map((b) => b.plays)
  );

  const trackMap = useMemo(
    () => new Map(MOCK_TRACKS.map((t) => [t.id, t])),
    []
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Listening Recap & Activity"
        subtitle="Your play records, peak hours, and shareable ocean poster"
      />

      <div className="px-4 md:px-7 space-y-6 pb-8">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full liquid-pill text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={() => setPosterOpen(true)}
            className="px-4 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Create Recap Poster
          </button>
        </div>

        {/* Hero Persona & Poster Banner */}
        <section className="liquid-glass-strong rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-pill text-[11px] font-semibold text-[var(--accent-cyan)]">
              <BarChart3 className="w-3.5 h-3.5" />
              Live Listening Analytics
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {recap.personaTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              You played <strong>{recap.totalPlays}</strong> tracks ({recap.totalHoursLabel}),
              peaking during <strong>{recap.peakPeriodLabel}</strong> ({recap.peakHourRange}).
            </p>
          </div>

          <button
            onClick={() => setPosterOpen(true)}
            className="self-start sm:self-center px-5 py-3 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Share / Export Poster
          </button>
        </section>

        {/* 4 Key Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="liquid-glass rounded-[24px] p-4 space-y-1">
            <Flame className="w-4 h-4 text-[var(--accent-cyan)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {recap.totalPlays}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Total Plays</p>
          </div>

          <div className="liquid-glass rounded-[24px] p-4 space-y-1">
            <Clock className="w-4 h-4 text-[var(--accent-cyan)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {recap.totalHoursLabel}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Time Listened ({recap.totalMinutes} mins)
            </p>
          </div>

          <div className="liquid-glass rounded-[24px] p-4 space-y-1">
            <BarChart3 className="w-4 h-4 text-[var(--accent-cyan)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {recap.peakHourRange}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Peak · {recap.peakPeriodLabel}
            </p>
          </div>

          <div className="liquid-glass rounded-[24px] p-4 space-y-1">
            <Disc3 className="w-4 h-4 text-[var(--accent-cyan)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)] truncate">
              {recap.topGenre}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Top Genre</p>
          </div>
        </section>

        {/* Listening Hours Chart + Top Played Tracks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Hourly Listening Activity */}
          <section className="liquid-glass rounded-[28px] p-5 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Listening Hours Activity
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                When you play music most throughout the day
              </p>
            </div>

            <div className="grid grid-cols-6 gap-2.5 items-end h-44 pt-4">
              {recap.hourBuckets.map((bucket) => {
                const heightPct = Math.max(
                  12,
                  Math.round((bucket.plays / maxBucketPlays) * 100)
                );
                const isPeak =
                  bucket.plays === maxBucketPlays && bucket.plays > 0;

                return (
                  <div
                    key={bucket.label}
                    className="flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <span className="text-[11px] font-mono font-semibold text-[var(--accent-cyan)]">
                      {bucket.plays}
                    </span>
                    <div className="w-full flex-1 flex items-end justify-center">
                      <div
                        className={`w-full max-w-[34px] rounded-t-xl rounded-b-md transition-all duration-500 ${
                          isPeak
                            ? "ocean-gradient-btn"
                            : "bg-sky-400/35 border border-sky-300/30"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-mono font-semibold text-[var(--text-primary)]">
                        {bucket.label}
                      </p>
                      <p className="text-[9px] text-[var(--text-muted)] hidden sm:block">
                        {bucket.range}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Top Played Tracks with Play Counts */}
          <section className="liquid-glass rounded-[28px] p-5 space-y-3.5">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Most Played Tracks
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Ranked by total plays recorded in Synseafy
              </p>
            </div>

            <div className="space-y-2.5">
              {recap.topTracks.slice(0, 5).map((item, idx) => (
                <button
                  key={item.track.id}
                  onClick={() => {
                    playTrack(item.track, MOCK_TRACKS);
                    recordPlayed(item.track.id);
                  }}
                  className="w-full liquid-pill rounded-2xl p-2.5 pr-3.5 flex items-center gap-3 hover:bg-[var(--glass-bg-hover)] transition-colors text-left cursor-pointer group"
                >
                  <span className="text-xs font-mono font-bold text-[var(--accent-cyan)] w-5 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <TrackArtwork
                    track={item.track}
                    className="w-10 h-10"
                    rounded="full"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)]">
                      {item.track.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {item.track.artist}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[var(--accent-cyan)]">
                      {item.plays} plays
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {Math.round(item.totalSeconds / 60)} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Chronological Play Record Log */}
        <section className="liquid-glass rounded-[28px] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Play Record Log ({records.length})
              </h3>
            </div>

            {records.length > 0 && (
              <button
                onClick={() => {
                  clearRecords();
                  showToast("Play activity log cleared");
                }}
                className="px-3 py-1.5 rounded-full liquid-pill text-[11px] font-semibold text-rose-400 hover:bg-rose-500/15 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Log
              </button>
            )}
          </div>

          {records.length > 0 ? (
            <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
              {records.map((rec) => {
                const track = trackMap.get(rec.trackId);
                if (!track) return null;
                return (
                  <div
                    key={rec.id}
                    className="liquid-pill rounded-2xl p-2.5 pr-4 flex items-center justify-between gap-3"
                  >
                    <button
                      onClick={() => {
                        playTrack(track, MOCK_TRACKS);
                        recordPlayed(track.id);
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <TrackArtwork
                          track={track}
                          className="w-10 h-10"
                          rounded="full"
                        />
                        <span className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)]">
                          {track.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {track.artist} · {formatDuration(rec.durationListened)}
                        </p>
                      </div>
                    </button>

                    <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                      {formatRecordTimestamp(rec.playedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] text-center py-6">
              Play any track to start recording your listening activity.
            </p>
          )}
        </section>
      </div>

      <RecapPosterModal
        isOpen={posterOpen}
        onClose={() => setPosterOpen(false)}
        recap={recap}
      />
    </div>
  );
}
