"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Pencil, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Playlist } from "@/src/domain/entities/playlist";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { CoverImage } from "@/src/presentation/components/ui/CoverImage";
import { ImagePickerButton } from "@/src/presentation/components/ui/ImagePickerButton";

interface EditPlaylistModalProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPlaylistModal({
  playlist,
  isOpen,
  onClose,
}: EditPlaylistModalProps) {
  const updatePlaylist = useLibraryStore((s) => s.updatePlaylist);
  const setPlaylistCover = useLibraryStore((s) => s.setPlaylistCover);
  const removePlaylistCover = useLibraryStore((s) => s.removePlaylistCover);
  // Live copy, so a new cover shows as soon as it's uploaded
  const live =
    useLibraryStore((s) => s.playlists.find((p) => p.id === playlist.id)) ??
    playlist;
  const showToast = useToastStore((s) => s.showToast);
  const [coverBusy, setCoverBusy] = useState(false);

  const changeCover = async (file: File) => {
    setCoverBusy(true);
    const error = await setPlaylistCover(playlist.id, file);
    setCoverBusy(false);
    showToast(error ?? "Cover updated");
  };

  const clearCover = async () => {
    setCoverBusy(true);
    const error = await removePlaylistCover(playlist.id);
    setCoverBusy(false);
    showToast(error ?? "Cover removed");
  };

  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updatePlaylist(playlist.id, name, description);
    showToast(`Updated "${name.trim()}"`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md liquid-glass-strong rounded-[32px] p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl ocean-gradient-btn flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    Edit Playlist
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Update cover, title or description
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cover image (uploads right away, independent of Save) */}
            <div className="flex items-center gap-4">
              <div
                className="relative overflow-hidden w-20 h-20 rounded-[22px] shrink-0 shadow-lg ring-2 ring-white/20 flex items-center justify-center text-white text-xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${live.coverGradient.from}, ${live.coverGradient.via}, ${live.coverGradient.to})`,
                }}
              >
                {live.name.slice(0, 2).toUpperCase()}
                <CoverImage url={live.coverUrl} alt={live.name} />
                {coverBusy && (
                  <span className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <ImagePickerButton
                  onPick={changeCover}
                  disabled={coverBusy}
                  label="Upload cover image"
                  className="px-3.5 py-2 rounded-full liquid-pill text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 hover:bg-[var(--glass-bg-hover)] cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                  {live.coverUrl ? "Change cover" : "Upload cover"}
                </ImagePickerButton>
                {live.coverUrl && (
                  <button
                    type="button"
                    onClick={clearCover}
                    disabled={coverBusy}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold text-rose-400 flex items-center gap-1.5 hover:bg-rose-500/15 cursor-pointer disabled:opacity-60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove cover
                  </button>
                )}
                <p className="text-[10px] text-[var(--text-muted)]">
                  JPG, PNG or WebP · cropped to a square
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full rounded-2xl liquid-pill px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl liquid-pill px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-400/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full liquid-pill text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
