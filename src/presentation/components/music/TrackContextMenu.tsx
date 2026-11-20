"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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

interface MenuAnchor {
  left: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
  origin: "top" | "bottom";
}

const MENU_WIDTH = 224;
const MENU_GAP = 8;
const EDGE_MARGIN = 12;
// Height of the closed menu (5 rows + divider + padding)
const MENU_BASE_HEIGHT = 200;
// Bottom chrome that covers the page: mobile mini player + tab bar, desktop player dock
const MOBILE_BOTTOM_CHROME = 176;
const DESKTOP_BOTTOM_CHROME = 104;

/**
 * Open below the button when it fits, otherwise above. Includes room for the
 * "Add to Playlist" submenu so expanding it never pushes the menu off-screen.
 * If neither side fits fully, use the roomier side and cap the height.
 */
function computeAnchor(rect: DOMRect, playlistCount: number): MenuAnchor {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bottomChrome = vw < 768 ? MOBILE_BOTTOM_CHROME : DESKTOP_BOTTOM_CHROME;

  const submenuHeight = Math.min(144, playlistCount * 30) + 8;
  const needed = MENU_BASE_HEIGHT + submenuHeight;

  const spaceBelow = vh - bottomChrome - rect.bottom - MENU_GAP;
  const spaceAbove = rect.top - MENU_GAP - EDGE_MARGIN;

  const openUp =
    spaceBelow < needed && (spaceAbove >= needed || spaceAbove > spaceBelow);

  const left = Math.max(
    EDGE_MARGIN,
    Math.min(vw - MENU_WIDTH - EDGE_MARGIN, rect.right - MENU_WIDTH)
  );

  return openUp
    ? {
        left,
        bottom: vh - rect.top + MENU_GAP,
        maxHeight: spaceAbove,
        origin: "bottom",
      }
    : {
        left,
        top: rect.bottom + MENU_GAP,
        maxHeight: Math.max(spaceBelow, MENU_BASE_HEIGHT),
        origin: "top",
      };
}

export function TrackContextMenu({ track }: TrackContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const { playlists, addTrackToPlaylist } = useLibraryStore();
  const showToast = useToastStore((s) => s.showToast);

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

    const close = () => {
      setOpen(false);
      setShowPlaylists(false);
    };

    // Page scroll closes the menu; scrolling inside the (height-capped) menu doesn't
    const handleScroll = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      close();
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
      setShowPlaylists(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setAnchor(computeAnchor(rect, playlists.length));
    }

    setOpen(true);
    setShowPlaylists(false);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(
      track.title
    )}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
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

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && anchor && (
              <motion.div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  y: anchor.origin === "bottom" ? 8 : -8,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  y: anchor.origin === "bottom" ? 8 : -8,
                }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  left: anchor.left,
                  top: anchor.top,
                  bottom: anchor.bottom,
                  maxHeight: anchor.maxHeight,
                  transformOrigin:
                    anchor.origin === "bottom" ? "bottom right" : "top right",
                }}
                className="fixed w-56 liquid-glass-dock rounded-2xl p-1.5 z-[999] shadow-2xl space-y-0.5 overflow-y-auto overscroll-contain"
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
                    className={`w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                      showPlaylists ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {showPlaylists && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>

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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
