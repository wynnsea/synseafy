"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import {
  useActiveTabPath,
  useTabPagerStore,
} from "@/src/application/stores/use-tab-pager-store";
import { HomeView } from "@/src/presentation/views/HomeView";
import { SearchView } from "@/src/presentation/views/SearchView";
import { LibraryView } from "@/src/presentation/views/LibraryView";
import { ProfileView } from "@/src/presentation/views/ProfileView";

// Left-to-right order matches the tab bar: [Home, Library, Profile] + Search orb
export const SWIPE_ROUTES = ["/", "/library", "/profile", "/search"] as const;

function isInsideHorizontalScrollOrControl(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    const tag = el.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      el.getAttribute("role") === "slider"
    ) {
      return true;
    }
    const style = window.getComputedStyle(el);
    const overflowX = style.overflowX;
    if (
      (overflowX === "auto" || overflowX === "scroll") &&
      el.scrollWidth > el.clientWidth + 4
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Native Banner-Style Mobile ViewPager
 * - Uses optimisticIndex so releasing a swipe transitions smoothly in one
 *   continuous motion with ZERO bounce-back while Next.js updates the URL.
 * - Each of the 4 slides has its own independent vertical scroll container
 *   (h-[100dvh] overflow-y-auto) so shorter pages like Search never scroll
 *   into empty space below their content.
 */
export function MobileSwipeNavigator({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isNowPlayingOpen = useUiStore((s) => s.isNowPlayingOpen);
  const isCreatePlaylistOpen = useUiStore((s) => s.isCreatePlaylistOpen);

  const activePath = useActiveTabPath();
  const setPending = useTabPagerStore((s) => s.setPending);
  const clearPending = useTabPagerStore((s) => s.clearPending);

  const routeIndex = SWIPE_ROUTES.indexOf(
    pathname as (typeof SWIPE_ROUTES)[number]
  );

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Once the URL actually changes, the optimistic target has done its job.
  useEffect(() => {
    clearPending();
  }, [pathname, clearPending]);

  // Optimistic index (shared with the tab bar) -> zero bounce, never stale
  const activeIndex = SWIPE_ROUTES.indexOf(
    activePath as (typeof SWIPE_ROUTES)[number]
  );
  const displayIndex =
    activeIndex !== -1 ? activeIndex : routeIndex === -1 ? 0 : routeIndex;

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    locked: "horizontal" | "vertical" | null;
    blocked: boolean;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      routeIndex === -1 ||
      isNowPlayingOpen ||
      isCreatePlaylistOpen ||
      e.touches.length !== 1
    ) {
      touchStartRef.current = null;
      return;
    }

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      locked: null,
      blocked: isInsideHorizontalScrollOrControl(e.target),
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const state = touchStartRef.current;
    if (!state || state.blocked || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dx = touch.clientX - state.x;
    const dy = touch.clientY - state.y;

    if (!state.locked) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      state.locked =
        Math.abs(dx) > Math.abs(dy) * 1.15 ? "horizontal" : "vertical";
    }

    if (state.locked !== "horizontal") return;

    setIsDragging(true);
    const atStart = displayIndex === 0 && dx > 0;
    const atEnd = displayIndex === SWIPE_ROUTES.length - 1 && dx < 0;
    setDragX(atStart || atEnd ? dx * 0.18 : dx);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const state = touchStartRef.current;
    touchStartRef.current = null;
    setIsDragging(false);

    if (!state || state.blocked || state.locked !== "horizontal") {
      setDragX(0);
      return;
    }

    const touch = e.changedTouches[0];
    const dx = touch.clientX - state.x;
    const dt = Math.max(1, Date.now() - state.time);
    const velocity = Math.abs(dx) / dt;
    const viewportW = window.innerWidth || 390;

    const shouldSwitch =
      Math.abs(dx) > viewportW * 0.2 || (Math.abs(dx) > 32 && velocity > 0.32);

    let targetIndex = displayIndex;
    if (shouldSwitch) {
      if (dx < 0 && displayIndex < SWIPE_ROUTES.length - 1) {
        targetIndex = displayIndex + 1;
      } else if (dx > 0 && displayIndex > 0) {
        targetIndex = displayIndex - 1;
      }
    }

    // Update pending target & reset dragX in the SAME batch -> zero bounce!
    setDragX(0);
    if (targetIndex !== displayIndex) {
      const target = SWIPE_ROUTES[targetIndex];
      setPending(target, pathname);
      router.replace(target, { scroll: false });
    }
  };

  // Detail routes (e.g. /playlist/[id], /artist/[slug], /album/[slug])
  if (routeIndex === -1) {
    return <div className="pb-[172px] md:pb-0">{children}</div>;
  }

  return (
    <>
      {/* Desktop: standard single-route view */}
      <div className="hidden md:block">{children}</div>

      {/* Mobile: Locked viewport 4-pane horizontal ViewPager with per-tab scroll */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartRef.current = null;
          setIsDragging(false);
          setDragX(0);
        }}
        className="md:hidden w-full h-[100dvh] overflow-hidden"
      >
        <div
          className="flex w-full h-full will-change-transform"
          style={{
            transform: `translate3d(calc(${-displayIndex * 100}% + ${dragX}px), 0, 0)`,
            transition: isDragging
              ? "none"
              : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="w-full shrink-0 min-w-full h-full overflow-y-auto overscroll-y-contain pb-[176px]">
            <HomeView />
          </div>
          <div className="w-full shrink-0 min-w-full h-full overflow-y-auto overscroll-y-contain pb-[176px]">
            <LibraryView />
          </div>
          <div className="w-full shrink-0 min-w-full h-full overflow-y-auto overscroll-y-contain pb-[176px]">
            <ProfileView />
          </div>
          <div className="w-full shrink-0 min-w-full h-full overflow-y-auto overscroll-y-contain pb-[176px]">
            <SearchView />
          </div>
        </div>
      </div>
    </>
  );
}
