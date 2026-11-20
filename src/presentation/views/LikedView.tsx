"use client";

import React, { useMemo, useState } from "react";
import { Heart, Clock, Play } from "lucide-react";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";

export function LikedView() {
  const [tab, setTab] = useState<"liked" | "recent">("liked");
  const { likedTrackIds, recentTrackIds, recordPlayed } = useLibraryStore();
  const playTrack = usePlayerStore((s) => s.playTrack);

  const likedTracks = useMemo(
    () =>
      likedTrackIds
        .map((id) => MOCK_TRACKS.find((t) => t.id === id))
        .filter((t): t is (typeof MOCK_TRACKS)[number] => Boolean(t)),
    [likedTrackIds]
  );

  const recentTracks = useMemo(
    () =>
      recentTrackIds
        .map((id) => MOCK_TRACKS.find((t) => t.id === id))
        .filter((t): t is (typeof MOCK_TRACKS)[number] => Boolean(t)),
    [recentTrackIds]
  );

  const activeList = tab === "liked" ? likedTracks : recentTracks;

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Favorites & History"
        subtitle="Your personal liked tracks and recently played sessions"
      />

      <div className="px-4 md:px-7 space-y-6">
        {/* Hero Glass Card */}
        <div className="liquid-glass-strong rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl ocean-gradient-btn flex items-center justify-center shrink-0">
              {tab === "liked" ? (
                <Heart className="w-7 h-7 fill-white text-white" />
              ) : (
                <Clock className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {tab === "liked" ? "Liked Songs" : "Recently Played"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {activeList.length} tracks saved locally
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTab("liked")}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                tab === "liked"
                  ? "ocean-gradient-btn"
                  : "liquid-pill text-[var(--text-secondary)]"
              }`}
            >
              Liked ({likedTracks.length})
            </button>
            <button
              onClick={() => setTab("recent")}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                tab === "recent"
                  ? "ocean-gradient-btn"
                  : "liquid-pill text-[var(--text-secondary)]"
              }`}
            >
              History ({recentTracks.length})
            </button>

            {activeList.length > 0 && (
              <button
                onClick={() => {
                  playTrack(activeList[0], activeList);
                  recordPlayed(activeList[0].id);
                }}
                aria-label="Play all"
                className="w-10 h-10 rounded-full ocean-gradient-btn flex items-center justify-center cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Track List */}
        {activeList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
            {activeList.map((track) => (
              <TrackPillRow
                key={track.id}
                track={track}
                queueContext={activeList}
              />
            ))}
          </div>
        ) : (
          <div className="liquid-glass rounded-[32px] p-10 text-center space-y-2">
            <p className="text-base font-semibold text-[var(--text-primary)]">
              Nothing here yet
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Tap the heart icon on any track to keep it in your personal ocean
              collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
