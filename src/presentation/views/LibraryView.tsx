"use client";

import React from "react";
import { Plus, Disc3 } from "lucide-react";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { PlaylistCard } from "@/src/presentation/components/music/PlaylistCard";

export function LibraryView() {
  const playlists = useLibraryStore((s) => s.playlists);
  const setCreatePlaylistOpen = useUiStore((s) => s.setCreatePlaylistOpen);

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Your Library"
        subtitle="Custom playlists crafted for your Wynnsea space"
      />

      <div className="px-4 md:px-7 space-y-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
            <Disc3 className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-[var(--accent-cyan)]" />
            <h2 className="text-base md:text-xl font-bold text-[var(--text-primary)] truncate">
              Custom Playlists ({playlists.length})
            </h2>
          </div>

          <button
            onClick={() => setCreatePlaylistOpen(true)}
            className="shrink-0 whitespace-nowrap px-3.5 py-2 md:px-4 md:py-2.5 rounded-full ocean-gradient-btn text-[11px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 hover:scale-[1.03] transition-transform cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            New Playlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      </div>
    </div>
  );
}
