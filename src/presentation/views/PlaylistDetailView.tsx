"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import {
  Play,
  Trash2,
  Plus,
  ArrowLeft,
  Check,
  GripVertical,
} from "lucide-react";
import { resolveTracks } from "@/src/infrastructure/data/catalog";
import { useCatalogStore } from "@/src/application/stores/use-catalog-store";
import { useSongSearch } from "@/src/application/hooks/use-song-search";
import { PlaylistActionsMenu } from "@/src/presentation/components/music/PlaylistActionsMenu";
import { CoverImage } from "@/src/presentation/components/ui/CoverImage";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { TrackPillRow } from "@/src/presentation/components/music/TrackPillRow";
import { EditPlaylistModal } from "@/src/presentation/components/music/EditPlaylistModal";

interface PlaylistDetailViewProps {
  playlistId: string;
}

export function PlaylistDetailView({ playlistId }: PlaylistDetailViewProps) {
  const router = useRouter();
  const {
    playlists,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    recordPlayed,
  } = useLibraryStore();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const [showPicker, setShowPicker] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const playlist = playlists.find((p) => p.id === playlistId);

  const tracks = useMemo(
    () => (playlist ? resolveTracks(playlist.trackIds) : []),
    [playlist]
  );

  // Song picker: search YouTube Music, or suggest recent + home feed songs
  const [pickerQuery, setPickerQuery] = useState("");
  const search = useSongSearch(pickerQuery);
  const recentTrackIds = useLibraryStore((s) => s.recentTrackIds);
  const home = useCatalogStore((s) => s.home);
  const pickerTracks = useMemo(() => {
    if (pickerQuery.trim()) return search.tracks;
    const seen = new Set<string>();
    return [...resolveTracks(recentTrackIds), ...(home?.quickPicks ?? []), ...(home?.trending ?? [])]
      .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
      .slice(0, 20);
  }, [pickerQuery, search.tracks, recentTrackIds, home]);

  if (!playlist) {
    return (
      <div className="w-full max-w-[1160px] mx-auto px-4 md:px-7 py-12">
        <div className="liquid-glass rounded-[32px] p-10 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Playlist not found
          </p>
          <button
            onClick={() => router.push("/library")}
            className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold cursor-pointer"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader title={playlist.name} subtitle="Custom Local Playlist" />

      <div className="px-4 md:px-7 space-y-6 pb-4">
        <button
          onClick={() => router.push("/library")}
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-full liquid-pill text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </button>

        {/* Playlist Hero */}
        <div className="liquid-glass-strong rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div
              className="relative overflow-hidden w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] shrink-0 shadow-xl ring-2 ring-white/20 flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${playlist.coverGradient.from}, ${playlist.coverGradient.via}, ${playlist.coverGradient.to})`,
              }}
            >
              {playlist.name.slice(0, 2).toUpperCase()}
              <CoverImage url={playlist.coverUrl} alt={playlist.name} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                {playlist.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {playlist.description}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                {tracks.length} songs · Created {playlist.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {tracks.length > 0 && (
              <button
                onClick={() => {
                  playTrack(tracks[0], tracks);
                  recordPlayed(tracks[0].id);
                }}
                className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Play All
              </button>
            )}
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="px-4 py-2.5 rounded-full liquid-pill text-xs font-semibold whitespace-nowrap text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[var(--accent-cyan)]" />
              Add Songs
            </button>
            <PlaylistActionsMenu
              onEdit={() => setIsEditOpen(true)}
              onDelete={() => {
                deletePlaylist(playlist.id);
                router.push("/library");
              }}
            />
          </div>
        </div>

        {/* Inline Track Picker */}
        {showPicker && (
          <div className="liquid-glass rounded-[28px] p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-cyan)] px-1">
              Tap to add or remove songs
            </p>
            <input
              type="search"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search songs to add"
              aria-label="Search songs to add"
              className="w-full liquid-pill rounded-full px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            />
            {search.loading && (
              <p className="text-xs text-[var(--text-muted)] px-1">Searching…</p>
            )}
            {!search.loading && pickerTracks.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] px-1">
                {pickerQuery.trim() ? "No songs found." : "Search for a song to add it here."}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pickerTracks.map((t) => {
                const included = playlist.trackIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() =>
                      included
                        ? removeTrackFromPlaylist(playlist.id, t.id)
                        : addTrackToPlaylist(playlist.id, t.id)
                    }
                    className={`flex items-center justify-between px-4 py-2.5 rounded-full text-left text-xs transition-all cursor-pointer ${
                      included
                        ? "ocean-gradient-btn"
                        : "liquid-pill text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
                    }`}
                  >
                    <span className="truncate font-medium">
                      {t.title} — {t.artist}
                    </span>
                    {included ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Playlist Tracks (Drag & Drop Reorder) */}
        {tracks.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--text-muted)] px-1">
              Drag tracks to reorder playlist
            </p>
            <Reorder.Group
              axis="y"
              values={tracks}
              onReorder={(newOrder) =>
                reorderPlaylistTracks(
                  playlist.id,
                  newOrder.map((t) => t.id)
                )
              }
              className="space-y-3 px-2 -mx-2 py-2"
            >
              {tracks.map((track) => (
                <Reorder.Item
                  key={track.id}
                  value={track}
                  whileDrag={{ scale: 1.015, zIndex: 20 }}
                  className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <TrackPillRow
                      track={track}
                      queueContext={tracks}
                      compactActions
                      menuItems={[
                        {
                          label: "Remove from this playlist",
                          icon: Trash2,
                          danger: true,
                          onSelect: () => removeTrackFromPlaylist(playlist.id, track.id),
                        },
                      ]}
                    />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        ) : (
          <div className="liquid-glass rounded-[32px] p-10 text-center space-y-2">
            <p className="text-base font-semibold text-[var(--text-primary)]">
              This playlist is empty
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Click &ldquo;Add Songs&rdquo; above to fill your ocean mix.
            </p>
          </div>
        )}
      </div>

      <EditPlaylistModal
        playlist={playlist}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
}
