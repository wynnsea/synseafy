"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MoreHorizontal,
  ListPlus,
  PlusCircle,
  User,
  Disc3,
  Share2,
  Check,
  ChevronRight,
} from "lucide-react";
import { Track } from "@/src/domain/entities/track";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { toSlug } from "@/src/application/use-cases/slugify";

interface TrackContextMenuProps {
  track: Track;
}

export function TrackContextMenu({ track }: TrackContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const { playlists, addTrackToPlaylist } = useLibraryStore();
  const showToast = useToastStore((s) => s.showToast);

  // Recalculate exact menu position whenever opened or submenu expands,
  // keeping it cleanly above the bottom player bar & inside the viewport.
  useEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return;

    const btnRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const bottomSafeZone = window.innerWidth >= 768 ? 112 : 168;
    const maxBottom = window.innerHeight - bottomSafeZone;

    const left = Math.max(
      12,
      Math.min(
        window.innerWidth - menuRect.width - 12,
        btnRect.right - menuRect.width
      )
    );

    let top = btnRect.bottom + 8;
    if (top + menuRect.height > maxBottom) {
      // Flip upward above the trigger button if it would hit the bottom player bar
      top = Math.max(12, btnRect.top - menuRect.height - 8);
    }

    setCoords({ top, left });
  }, [open, showPlaylists, playlists.length]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
        setShowPlaylists(false);
      }
    };

    const handleScrollOrResize = () => {
      setOpen(false);
      setShowPlaylists(false);
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [open]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
    setShowPlaylists(false);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(
      track.title
    )}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => { });
    }
    showToast(`Link copied for "${track.title}"`);
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label="More options"
        className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{ top: coords.top, left: coords.left }}
            className="fixed w-56 liquid-glass-dock rounded-2xl p-1.5 z-[999] shadow-2xl space-y-0.5"
          >
            <button
              type="button"
              onClick={() => {
                addToQueue(track);
                showToast(`Added "${track.title}" to Queue`);
                setOpen(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center gap-3 cursor-pointer"
            >
              <ListPlus className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              <span>Add to Queue</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPlaylists((v) => !v)}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <PlusCircle className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
                <span>Add to Playlist</span>
              </span>
              <ChevronRight
                className={`w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 transition-transform ${showPlaylists ? "rotate-90" : ""
                  }`}
              />
            </button>

            {showPlaylists && (
              <div
                style={{ marginLeft: 19.5, paddingLeft: 11.5 }}
                className="pr-1 py-1 space-y-0.5 max-h-36 overflow-y-auto no-scrollbar border-l border-[var(--glass-border-side)]"
              >
                {playlists.map((pl) => {
                  const alreadyIn = pl.trackIds.includes(track.id);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => {
                        addTrackToPlaylist(pl.id, track.id);
                        showToast(
                          alreadyIn
                            ? `Already in "${pl.name}"`
                            : `Added to "${pl.name}"`
                        );
                        setOpen(false);
                        setShowPlaylists(false);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg text-left text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate">{pl.name}</span>
                      {alreadyIn && (
                        <Check className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-[var(--text-muted)]/20 my-1 mx-2" />

            <Link
              href={`/artist/${toSlug(track.artist)}`}
              onClick={() => setOpen(false)}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center gap-3"
            >
              <User className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              <span>Go to Artist</span>
            </Link>

            <Link
              href={`/album/${toSlug(track.album)}`}
              onClick={() => setOpen(false)}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center gap-3"
            >
              <Disc3 className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              <span>Go to Album</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center gap-3 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              <span>Copy Track Link</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
