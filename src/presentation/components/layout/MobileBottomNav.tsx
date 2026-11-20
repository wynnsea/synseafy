"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Heart, Library } from "lucide-react";

/**
 * Mobile App Bottom Bar — MAX 4 menus
 * Supports BOTH tapping any menu item AND sliding your finger smoothly
 * across the liquid glass capsule to scrub between menus!
 */
const MOBILE_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/liked", label: "Liked", icon: Heart },
  { href: "/library", label: "Library", icon: Library },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const lastScrubIndexRef = useRef<number | null>(null);

  const scrubToClientX = (clientX: number) => {
    const nav = navRef.current;
    if (!nav) return;
    const rect = nav.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(0.999, (clientX - rect.left) / rect.width));
    const idx = Math.floor(ratio * MOBILE_NAV.length);
    if (idx !== lastScrubIndexRef.current) {
      lastScrubIndexRef.current = idx;
      const target = MOBILE_NAV[idx];
      if (target && target.href !== pathname) {
        router.push(target.href);
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
      <nav
        ref={navRef}
        aria-label="Mobile Navigation"
        onTouchStart={() => {
          lastScrubIndexRef.current = null;
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            scrubToClientX(e.touches[0].clientX);
          }
        }}
        onTouchEnd={() => {
          lastScrubIndexRef.current = null;
        }}
        className="pointer-events-auto touch-pan-y liquid-glass-dock rounded-full p-2 flex items-center justify-between gap-2 w-full max-w-[390px] select-none"
      >
        {MOBILE_NAV.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center"
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={`relative flex items-center justify-center gap-2 rounded-full transition-colors ${
                  isActive
                    ? "px-5 py-3 text-white font-semibold"
                    : "w-12 h-12 bg-[var(--glass-orb-bg)] border border-[var(--glass-orb-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-liquid-active-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full ocean-gradient-btn z-0"
                  />
                )}
                <Icon className="relative z-10 w-[19px] h-[19px] shrink-0" />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="relative z-10 text-sm tracking-tight whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
