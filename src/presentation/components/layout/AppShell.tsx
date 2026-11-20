"use client";

import React, { Suspense, useEffect } from "react";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { DynamicAmbientBackground } from "@/src/presentation/components/layout/DynamicAmbientBackground";
import { DesktopLiquidSidebar } from "@/src/presentation/components/layout/DesktopLiquidSidebar";
import { MobileBottomNav } from "@/src/presentation/components/layout/MobileBottomNav";
import { DesktopPlayerBar } from "@/src/presentation/components/player/DesktopPlayerBar";
import { MobileMiniPlayer } from "@/src/presentation/components/player/MobileMiniPlayer";
import { NowPlayingSheet } from "@/src/presentation/components/player/NowPlayingSheet";
import { SideDrawerPanel } from "@/src/presentation/components/player/SideDrawerPanel";
import { CreatePlaylistModal } from "@/src/presentation/components/music/CreatePlaylistModal";
import { PwaRegistrar } from "@/src/presentation/components/pwa/PwaRegistrar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const tick = usePlayerStore((s) => s.tick);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay]);

  return (
    <div className="relative min-h-screen md:h-screen md:overflow-hidden w-full flex text-[var(--text-primary)]">
      <DynamicAmbientBackground />

      {/* Desktop: Fixed Non-Scrolling Floating Liquid Glass Capsule Dock */}
      <Suspense fallback={null}>
        <DesktopLiquidSidebar />
      </Suspense>

      {/* Main Content Column: scrolls independently on desktop; hosts its own aligned player bar */}
      <div className="relative flex-1 min-w-0 flex flex-col md:h-screen">
        <main className="flex-1 min-w-0 md:overflow-y-auto pb-[172px] md:pb-[124px]">
          {children}
        </main>

        {/* Desktop Persistent Liquid Glass Dock (aligned cleanly inside main column, never overlaps sidebar) */}
        <DesktopPlayerBar />
      </div>

      {/* Desktop Right Slide-Over Lyrics / Queue Glass Drawer */}
      <SideDrawerPanel />

      {/* Mobile Bottom Scrim + Persistent Mini Player + Floating 4-Menu Bottom Bar */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 h-[176px] z-30 pointer-events-none bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/90 to-transparent"
        aria-hidden
      />
      <MobileMiniPlayer />
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>

      {/* Fullscreen Immersive Now Playing Sheet */}
      <NowPlayingSheet />

      {/* Create Playlist Liquid Modal */}
      <CreatePlaylistModal />

      {/* PWA Service Worker & Install Prompt Handler */}
      <PwaRegistrar />
    </div>
  );
}
