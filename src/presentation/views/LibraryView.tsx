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
          <div className="flex items-center gap-2.5">
            <Disc3 className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Custom Playlists ({playlists.length})
            </h2>
          </div>

          <button
            onClick={() => setCreatePlaylistOpen(true)}
            className="px-4 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-1.5 hover:scale-[1.03] transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4" />
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
