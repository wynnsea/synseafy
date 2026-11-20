"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

/**
 * ••• button with Edit / Delete for a playlist. Delete needs a second tap,
 * since it can't be undone.
 */
export function PlaylistActionsMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Playlist options"
        title="Playlist options"
        className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--accent-cyan)] cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-12 w-52 liquid-glass-dock rounded-2xl p-1.5 z-40 shadow-2xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center gap-3 cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              Edit playlist
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                if (!confirming) {
                  setConfirming(true);
                  return;
                }
                setOpen(false);
                onDelete();
              }}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center gap-3 cursor-pointer text-rose-400 ${
                confirming ? "bg-rose-500/15" : "hover:bg-rose-500/15"
              }`}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {confirming ? "Tap again to delete" : "Delete playlist"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
