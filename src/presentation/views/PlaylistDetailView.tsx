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
  Pencil,
  GripVertical,
} from "lucide-react";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";
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

  const tracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.trackIds
      .map((id) => MOCK_TRACKS.find((t) => t.id === id))
      .filter((t): t is (typeof MOCK_TRACKS)[number] => Boolean(t));
  }, [playlist]);

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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full liquid-pill text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </button>

        {/* Playlist Hero */}
        <div className="liquid-glass-strong rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] shrink-0 shadow-xl ring-2 ring-white/20 flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${playlist.coverGradient.from}, ${playlist.coverGradient.via}, ${playlist.coverGradient.to})`,
              }}
            >
              {playlist.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
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

          <div className="flex items-center gap-2.5">
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
              className="px-4 py-2.5 rounded-full liquid-pill text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[var(--accent-cyan)]" />
              Add Songs
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit Playlist"
              className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--accent-cyan)] cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                deletePlaylist(playlist.id);
                router.push("/library");
              }}
              title="Delete Playlist"
              className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-rose-400 hover:bg-rose-500/15 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Track Picker */}
        {showPicker && (
          <div className="liquid-glass rounded-[28px] p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-cyan)] px-1">
              Tap to add or remove songs
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOCK_TRACKS.map((t) => {
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
                      extraAction={
                        <button
                          onClick={() =>
                            removeTrackFromPlaylist(playlist.id, track.id)
                          }
                          title="Remove from playlist"
                          className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      }
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
