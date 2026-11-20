"use client";

import React, { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useUserDataSync } from "@/src/application/stores/use-user-data-sync";
import { useCatalogStore } from "@/src/application/stores/use-catalog-store";
import { clearPendingListen } from "@/src/application/stores/pending-listen";
import { isSupabaseConfigured } from "@/src/infrastructure/supabase/client";
import { appConfig } from "@/src/infrastructure/config/app-config";
import { YouTubeEngine } from "@/src/presentation/components/player/YouTubeEngine";
import { AUTH_ROUTE_PATHS } from "@/src/infrastructure/config/app-config";
import { DynamicAmbientBackground } from "@/src/presentation/components/layout/DynamicAmbientBackground";
import { DesktopLiquidSidebar } from "@/src/presentation/components/layout/DesktopLiquidSidebar";
import { MobileBottomNav } from "@/src/presentation/components/layout/MobileBottomNav";
import { MobileSwipeNavigator } from "@/src/presentation/components/layout/MobileSwipeNavigator";
import { DesktopPlayerBar } from "@/src/presentation/components/player/DesktopPlayerBar";
import { MobileMiniPlayer } from "@/src/presentation/components/player/MobileMiniPlayer";
import { NowPlayingSheet } from "@/src/presentation/components/player/NowPlayingSheet";
import { SideDrawerPanel } from "@/src/presentation/components/player/SideDrawerPanel";
import { DesktopRightRail } from "@/src/presentation/components/layout/DesktopRightRail";
import { CreatePlaylistModal } from "@/src/presentation/components/music/CreatePlaylistModal";
import { PwaRegistrar } from "@/src/presentation/components/pwa/PwaRegistrar";
import { LiquidToast } from "@/src/presentation/components/ui/LiquidToast";

function ShellChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Player UI only appears once a song has been picked
  const hasActiveTrack = usePlayerStore((s) => s.hasActiveTrack);
  const isAuthPage = AUTH_ROUTE_PATHS.includes(pathname);

  if (isAuthPage) {
    return <main className="flex-1 min-w-0 min-h-screen">{children}</main>;
  }

  return (
    <>
      {/* Desktop: Fixed Non-Scrolling Floating Liquid Glass Capsule Dock */}
      <DesktopLiquidSidebar />

      {/* Main Content Column: scrolls independently on desktop; hosts its own aligned player bar */}
      <div className="relative flex-1 min-w-0 flex flex-col md:h-screen">
        <main
          className={`flex-1 min-w-0 md:overflow-y-auto ${
            hasActiveTrack ? "md:pb-[124px]" : "md:pb-8"
          }`}
        >
          <MobileSwipeNavigator>{children}</MobileSwipeNavigator>
        </main>

        {/* Desktop Persistent Liquid Glass Dock */}
        <DesktopPlayerBar />
      </div>

      {/* Wide desktop: extra content column (trending, artists, recap) */}
      <DesktopRightRail />

      {/* Desktop Right Slide-Over Lyrics / Queue Glass Drawer */}
      <SideDrawerPanel />

      {/* Mobile Bottom Scrim + Persistent Mini Player + Floating 4-Menu Bottom Bar */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-30 pointer-events-none bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/90 to-transparent ${
          hasActiveTrack ? "h-[176px]" : "h-[110px]"
        }`}
        aria-hidden
      />
      <MobileMiniPlayer />
      <MobileBottomNav />

      {/* Fullscreen Immersive Now Playing Sheet */}
      <NowPlayingSheet />

      {/* Create Playlist Liquid Modal */}
      <CreatePlaylistModal />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const tick = usePlayerStore((s) => s.tick);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load / clear the signed-in user's library, history, searches and settings
  useUserDataSync();

  // Home feed (trending, quick picks, artists) used across pages
  const loadHome = useCatalogStore((s) => s.loadHome);
  useEffect(() => {
    loadHome();
  }, [loadHome]);

  // Restore the Supabase session and keep the auth store in sync with it
  useEffect(() => {
    if (!isSupabaseConfigured) {
      useAuthStore.setState({ status: "ready" });
      return;
    }
    return useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Mock songs have no audio: simulate playback. Real songs are timed by YouTubeEngine.
      if (appConfig.useMockData) tick();
      // While hidden the page may be killed at any moment: keep the stash current
      if (document.hidden) usePlayerStore.getState().stashListen();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Don't lose a listen in progress when the tab is closed or the app is backgrounded.
  // It's stashed while hidden and saved on the next app load (see flushPendingListen).
  useEffect(() => {
    const onHide = () => usePlayerStore.getState().stashListen();
    const onVisibility = () => {
      if (document.hidden) onHide();
      // Back in view: the listen simply continues, so drop the stale stash
      else clearPendingListen();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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

      <Suspense fallback={<div className="min-h-screen w-full" />}>
        <ShellChrome>{children}</ShellChrome>
      </Suspense>

      {/* Global Liquid Glass Toast Notifications */}
      <LiquidToast />

      {/* The one YouTube player behind real playback (not used with mock data) */}
      {!appConfig.useMockData && <YouTubeEngine />}

      {/* PWA Service Worker & Install Prompt Handler */}
      <PwaRegistrar />
    </div>
  );
}
