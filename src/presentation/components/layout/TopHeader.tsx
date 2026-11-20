"use client";

import React from "react";
import { Sun, Moon, Sparkles, ListMusic, Mic2, Download } from "lucide-react";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { usePwaStore } from "@/src/application/stores/use-pwa-store";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
}

export function TopHeader({
  title = "Hi, Wynnsea",
  subtitle = "Deep ocean soundscape ready",
}: TopHeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { activeDrawer, toggleDrawer, setNowPlayingOpen } = useUiStore();
  const { deferredPrompt, isInstalled, promptInstall } = usePwaStore();

  return (
    <header className="sticky top-0 z-20 pt-4 pb-3 px-4 md:px-7">
      <div className="liquid-glass-dock rounded-full px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Avatar + Personal Greeting (matches reference image) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full ocean-gradient-soft p-[2px] shrink-0 shadow-md">
            <div className="w-full h-full rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-bold text-[var(--accent-cyan)]">
              WS
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] md:text-base font-semibold tracking-tight text-[var(--text-primary)] truncate">
              {title}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] truncate hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Glass Action Orbs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* One-click PWA Install button when browser supports install */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={promptInstall}
              title="Install Synseafy App"
              className="h-10 px-3.5 rounded-full ocean-gradient-btn flex items-center gap-1.5 text-xs font-semibold hover:scale-105 transition-transform cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}
          {/* Desktop Lyrics / Queue quick triggers */}
          <button
            onClick={() => toggleDrawer("lyrics")}
            title="Lyrics Panel"
            className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all cursor-pointer ${
              activeDrawer === "lyrics"
                ? "ocean-gradient-btn"
                : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleDrawer("queue")}
            title="Up Next Queue"
            className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all cursor-pointer ${
              activeDrawer === "queue"
                ? "ocean-gradient-btn"
                : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Immersive Now Playing trigger */}
          <button
            onClick={() => setNowPlayingOpen(true)}
            title="Immersive Player"
            className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--accent-cyan)] hover:scale-105 transition-transform cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Theme Toggle (always accessible on mobile & desktop) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark or Light Theme"
            className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:scale-105 transition-transform cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-[18px] h-[18px] text-sky-300" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-sky-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
