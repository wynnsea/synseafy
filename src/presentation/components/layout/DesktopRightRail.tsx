"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Flame,
  LogIn,
  Play,
  Users,
} from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useActivityStore } from "@/src/application/stores/use-activity-store";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { toSlug } from "@/src/application/use-cases/slugify";
import { getCatalogTrack } from "@/src/infrastructure/data/catalog";
import { useCatalogStore } from "@/src/application/stores/use-catalog-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";
import { TrackArtwork } from "@/src/presentation/components/music/TrackArtwork";
import { EqualizerBars } from "@/src/presentation/components/music/EqualizerBars";
import { ProfileMenu } from "@/src/presentation/components/layout/ProfileMenu";
import { ThemeToggleButton } from "@/src/presentation/components/layout/ThemeToggleButton";
import { NowPlayingPanel } from "@/src/presentation/components/player/NowPlayingPanel";
import { motion } from "framer-motion";

const TRENDING_COUNT = 10;
const ARTIST_COUNT = 6;

function TrendingRow({
  track,
  rank,
  list,
}: {
  track: Track;
  rank: number;
  list: Track[];
}) {
  const { hasActiveTrack, currentTrack, isPlaying, playTrack, togglePlay } =
    usePlayerStore();
  const recordPlayed = useLibraryStore((s) => s.recordPlayed);
  const isCurrent = hasActiveTrack && currentTrack.id === track.id;

  return (
    <button
      type="button"
      onClick={() => {
        if (isCurrent) {
          togglePlay();
          return;
        }
        playTrack(track, list);
        recordPlayed(track.id);
      }}
      className="group w-full flex items-center gap-3 p-1.5 pr-2 rounded-2xl text-left hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
    >
      <span className="w-4 text-center text-xs font-bold text-[var(--text-muted)] shrink-0">
        {rank}
      </span>
      <div className="relative shrink-0">
        <TrackArtwork track={track} className="w-11 h-11" rounded="2xl" />
        <span className="absolute inset-0 rounded-2xl bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-4 h-4 text-white fill-white" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] font-semibold truncate ${
            isCurrent
              ? "text-[var(--accent-cyan)]"
              : "text-[var(--text-primary)]"
          }`}
        >
          {track.title}
        </p>
        <p className="text-[11px] text-[var(--text-secondary)] truncate">
          {track.artist}
        </p>
      </div>
      {isCurrent && <EqualizerBars active={isPlaying} />}
    </button>
  );
}

/**
 * Right column on wide desktops (xl+). Account pod on top; below it,
 * discovery (trending, artists, recap) until a song is picked, then the
 * Lyrics / Up Next panel for the current song.
 */
export function DesktopRightRail() {
  const activeDrawer = useUiStore((s) => s.activeDrawer);
  const setActiveDrawer = useUiStore((s) => s.setActiveDrawer);
  const hasActiveTrack = usePlayerStore((s) => s.hasActiveTrack);
  const user = useAuthStore((s) => s.user);
  const records = useActivityStore((s) => s.records);

  const home = useCatalogStore((s) => s.home);
  const trending = useMemo(
    () => (home?.trending ?? []).slice(0, TRENDING_COUNT),
    [home],
  );
  const artists = useMemo(
    () => (home?.artists ?? []).slice(0, ARTIST_COUNT),
    [home],
  );

  // Most played song in the loaded history
  const topTrack = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of records)
      counts.set(r.trackId, (counts.get(r.trackId) ?? 0) + 1);
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? getCatalogTrack(best[0]) : undefined;
  }, [records]);
  const minutes = Math.round(
    records.reduce((sum, r) => sum + r.durationListened, 0) / 60,
  );

  return (
    // Exactly one screen tall: fixed pods top and bottom, Trending stretches/scrolls in between
    <aside className="hidden xl:flex flex-col gap-3 w-[320px] h-screen p-4 pl-1 shrink-0 z-20">
      {/* Account pod (mirrors the logo pod on the left) */}
      <div className="liquid-glass-strong rounded-[28px] p-3 flex items-center gap-2 shrink-0 relative z-10">
        {user ? (
          <ProfileMenu showName />
        ) : (
          <Link
            href={APP_ROUTES.login}
            className="flex-1 h-10 px-3.5 rounded-full ocean-gradient-btn flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
        <ThemeToggleButton />
      </div>

      {hasActiveTrack ? (
        /* A song is playing: this column becomes the Lyrics / Up Next panel */
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="liquid-glass-strong rounded-[28px] p-4 flex-1 min-h-0 flex flex-col gap-4"
        >
          <div className="flex-1 min-h-0">
            <NowPlayingPanel
              tab={activeDrawer ?? "lyrics"}
              onTabChange={setActiveDrawer}
            />
          </div>
        </motion.section>
      ) : (
        <>
          {/* Trending Now */}
          <section className="liquid-glass rounded-[28px] p-3.5 flex-1 min-h-0 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1.5 pt-0.5">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[var(--accent-cyan)]" />
                Trending Now
              </h2>
              <Link
                href={APP_ROUTES.search}
                className="text-[11px] font-semibold text-[var(--accent-cyan)] hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-0.5 -mx-1 px-1">
              {trending.map((t, i) => (
                <TrendingRow
                  key={t.id}
                  track={t}
                  rank={i + 1}
                  list={trending}
                />
              ))}
            </div>
          </section>

          {/* Popular Artists */}
          <section className="liquid-glass rounded-[28px] p-3.5 space-y-3 shrink-0">
            <h2 className="px-1.5 pt-0.5 text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent-cyan)]" />
              Popular Artists
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {artists.map((a) => (
                <Link
                  key={a.id}
                  href={`/artist/${toSlug(a.name)}`}
                  className="group flex flex-col items-center gap-1.5 p-1.5 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors"
                >
                  {a.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote YouTube image, sized by CSS
                    <img
                      src={a.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover ring-1 ring-white/20"
                    />
                  ) : (
                    <span className="w-14 h-14 rounded-full ocean-gradient-soft flex items-center justify-center text-sm font-bold text-white">
                      {a.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="w-full text-center text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">
                    {a.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recap teaser */}
          {user ? (
            <Link
              href={APP_ROUTES.recap}
              className="group liquid-glass-strong rounded-[28px] p-4 flex items-center gap-3.5 hover:bg-[var(--glass-bg-hover)] transition-colors shrink-0"
            >
              <div className="w-11 h-11 rounded-2xl ocean-gradient-btn flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Your Recap
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  {records.length > 0
                    ? `${records.length} plays · ${minutes} min${topTrack ? ` · Top: ${topTrack.title}` : ""}`
                    : "Play some songs to build your recap"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--accent-cyan)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <section className="liquid-glass-strong rounded-[28px] p-4 space-y-3 shrink-0">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Make it yours
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Sign in to save liked songs, build playlists and get your
                  listening recap.
                </p>
              </div>
              <Link
                href={APP_ROUTES.login}
                className="w-full py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </section>
          )}
        </>
      )}
    </aside>
  );
}
