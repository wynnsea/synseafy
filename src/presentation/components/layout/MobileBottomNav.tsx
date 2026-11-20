"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Heart, Library } from "lucide-react";

/**
 * Mobile App Bottom Bar — MAX 4 menus
 * Active item expands into a crisp ocean-blue gradient capsule with white
 * icon + label; inactive items sit in high-contrast circular glass orbs.
 */
const MOBILE_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/liked", label: "Liked", icon: Heart },
  { href: "/library", label: "Library", icon: Library },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto liquid-glass-dock rounded-full p-2 flex items-center justify-between gap-2 w-full max-w-[390px]"
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
