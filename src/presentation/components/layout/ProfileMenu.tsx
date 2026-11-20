"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";
import { UserAvatar } from "@/src/presentation/components/ui/UserAvatar";

/**
 * Header avatar with a dropdown (Settings, Sign out). Desktop/tablet only;
 * on mobile the Profile tab covers this.
 */
export function ProfileMenu({ showName = false }: { showName?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const showToast = useToastStore((s) => s.showToast);
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close when navigating (Settings link, or any other route change).
  // Adjusting state during render on prop change is the React-recommended pattern.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={rootRef} className={`relative ${showName ? "min-w-0 flex-1" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`h-10 pl-1 pr-2.5 rounded-full flex items-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer ${
          showName ? "w-full gap-2.5" : "liquid-pill"
        }`}
      >
        <UserAvatar user={user} className="w-8 h-8 text-[11px]" />
        {showName && (
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[13px] font-semibold text-[var(--text-primary)] truncate">
              {user.name}
            </span>
            <span className="block text-[11px] text-[var(--text-muted)] truncate">
              {user.email}
            </span>
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
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
            className="absolute right-0 top-12 w-60 liquid-glass-dock rounded-2xl p-1.5 z-50 shadow-2xl"
          >
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {user.email}
              </p>
            </div>

            <div className="h-px bg-[var(--text-muted)]/20 my-1 mx-2" />

            <Link
              href={APP_ROUTES.profile}
              role="menuitem"
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center gap-3"
            >
              <Settings className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              Settings
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut().then(() => showToast("Signed out of Synseafy"));
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-rose-400 hover:bg-rose-500/15 flex items-center gap-3 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
