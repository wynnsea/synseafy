"use client";

import React, { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { HomeView } from "@/src/presentation/views/HomeView";
import { SearchView } from "@/src/presentation/views/SearchView";
import { LikedView } from "@/src/presentation/views/LikedView";
import { LibraryView } from "@/src/presentation/views/LibraryView";

const SWIPE_ROUTES = ["/", "/search", "/liked", "/library"] as const;

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
 * On mobile (< md) for the 4 primary tabs, all 4 screens sit side-by-side in a
 * horizontal track so swiping left/right directly slides the actual next/prev
 * screen into view 1:1 like a carousel banner, while tapping the bottom nav
 * smoothly animates the slide to that tab.
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

  const activeIndex = SWIPE_ROUTES.indexOf(
    pathname as (typeof SWIPE_ROUTES)[number]
  );

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    locked: "horizontal" | "vertical" | null;
    blocked: boolean;
  } | null>(null);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      activeIndex === -1 ||
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
    const atStart = activeIndex === 0 && dx > 0;
    const atEnd = activeIndex === SWIPE_ROUTES.length - 1 && dx < 0;
    setDragX(atStart || atEnd ? dx * 0.22 : dx);
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
      Math.abs(dx) > viewportW * 0.22 || (Math.abs(dx) > 36 && velocity > 0.35);

    if (shouldSwitch) {
      if (dx < 0 && activeIndex < SWIPE_ROUTES.length - 1) {
        router.push(SWIPE_ROUTES[activeIndex + 1]);
      } else if (dx > 0 && activeIndex > 0) {
        router.push(SWIPE_ROUTES[activeIndex - 1]);
      }
    }

    setDragX(0);
  };

  // Detail routes (e.g. /playlist/[id]) render normally on both mobile & desktop
  if (activeIndex === -1) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop: standard single-route view */}
      <div className="hidden md:block">{children}</div>

      {/* Mobile: Real 4-pane horizontal banner slider */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartRef.current = null;
          setIsDragging(false);
          setDragX(0);
        }}
        className="md:hidden w-full overflow-x-hidden"
      >
        <div
          className="flex items-start w-full will-change-transform"
          style={{
            transform: `translate3d(calc(${-activeIndex * 100}% + ${dragX}px), 0, 0)`,
            transition: isDragging
              ? "none"
              : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="w-full shrink-0 min-w-full">
            <HomeView />
          </div>
          <div className="w-full shrink-0 min-w-full">
            <SearchView />
          </div>
          <div className="w-full shrink-0 min-w-full">
            <LikedView />
          </div>
          <div className="w-full shrink-0 min-w-full">
            <LibraryView />
          </div>
        </div>
      </div>
    </>
  );
}
