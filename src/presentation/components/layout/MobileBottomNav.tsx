"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Library, User, type LucideIcon } from "lucide-react";
import {
  useActiveTabPath,
  useTabPagerStore,
} from "@/src/application/stores/use-tab-pager-store";

/**
 * iOS 26-style Liquid Glass tab bar: one capsule with stacked icon + label tabs.
 * The active tab is marked by a clear glass "lens" that slides between items.
 * Order matches the swipe pager; highlight state is shared with
 * MobileSwipeNavigator so they never disagree.
 */
const CAPSULE_TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/profile", label: "Profile", icon: User },
];

const LENS_SPRING = { type: "spring", stiffness: 460, damping: 36 } as const;

function isTabActive(href: string, activePath: string): boolean {
  return href === "/" ? activePath === "/" : activePath.startsWith(href);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activePath = useActiveTabPath();
  const setPending = useTabPagerStore((s) => s.setPending);
  const capsuleRef = useRef<HTMLElement | null>(null);
  const lastScrubIndexRef = useRef<number | null>(null);

  const goTo = (href: string) => {
    if (href === activePath) return;
    setPending(href, pathname);
    router.push(href);
  };

  // Slide a finger across the capsule to scrub between its tabs
  const scrubToClientX = (clientX: number) => {
    const nav = capsuleRef.current;
    if (!nav) return;
    const rect = nav.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(0.999, (clientX - rect.left) / rect.width)
    );
    const idx = Math.floor(ratio * CAPSULE_TABS.length);
    if (idx !== lastScrubIndexRef.current) {
      lastScrubIndexRef.current = idx;
      goTo(CAPSULE_TABS[idx].href);
    }
  };

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-[390px] flex items-center">
        <nav
          ref={capsuleRef}
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
          className="pointer-events-auto touch-pan-y liquid-glass-bar rounded-full h-16 p-1 flex-1 flex items-center select-none"
        >
          {CAPSULE_TABS.map((item) => {
            const isActive = isTabActive(item.href, activePath);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(item.href);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex-1 h-full flex flex-col items-center justify-center gap-[3px] rounded-full transition-colors duration-200 ${isActive
                  ? "text-[var(--tab-active)]"
                  : "text-[var(--text-primary)] opacity-85 active:opacity-60"
                  }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-liquid-lens"
                    transition={LENS_SPRING}
                    className="absolute inset-0 rounded-full liquid-lens"
                    aria-hidden
                  />
                )}
                <Icon
                  className="relative z-10 w-[22px] h-[22px] shrink-0"
                  strokeWidth={isActive ? 2.3 : 1.9}
                />
                <span className="relative z-10 text-[10.5px] leading-none font-semibold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
