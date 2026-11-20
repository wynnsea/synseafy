"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Pencil } from "lucide-react";
import { Playlist } from "@/src/domain/entities/playlist";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";

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
  const showToast = useToastStore((s) => s.showToast);

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
                    Update title or description
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
