"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useUiStore } from "@/src/application/stores/use-ui-store";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/liked", label: "Liked Songs", icon: Heart },
];

export function DesktopLiquidSidebar() {
  const pathname = usePathname();
  const playlists = useLibraryStore((s) => s.playlists);
  const { isSidebarExpanded, toggleSidebar, setCreatePlaylistOpen } =
    useUiStore();

  return (
    <aside
      className={`hidden md:flex flex-col gap-3 h-screen p-3 lg:p-4 pr-1.5 lg:pr-2 shrink-0 z-30 select-none transition-all duration-500 ease-out overflow-hidden ${
        isSidebarExpanded ? "w-[88px] lg:w-[254px]" : "w-[88px] lg:w-[96px]"
      }`}
    >
      {/* POD 1: Floating Liquid Brand Pod (auto-compact rail on md tablet, expandable on lg+) */}
      <div className="liquid-glass-strong rounded-[28px] p-3 lg:p-3.5 flex flex-col gap-3 shrink-0">
        <div
          className={`flex items-center justify-center ${
            isSidebarExpanded ? "lg:justify-between" : ""
          }`}
        >
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-2xl liquid-pill p-1.5 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/brand/logo-v3.png"
                alt="Synseafy Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(56,189,248,0.45)]"
                priority
              />
            </div>
            {isSidebarExpanded && (
              <div className="hidden lg:block min-w-0">
                <p className="font-semibold tracking-tight text-[15px] leading-tight truncate text-[var(--text-primary)]">
                  Synseafy
                </p>
                <p className="text-[11px] font-medium text-[var(--accent-cyan)] tracking-wide">
                  Liquid Glass
                </p>
              </div>
            )}
          </Link>

          {isSidebarExpanded && (
            <button
              onClick={toggleSidebar}
              title="Compact Dock"
              className="hidden lg:flex w-8 h-8 rounded-full liquid-pill items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isSidebarExpanded && (
          <div className="hidden lg:flex justify-center">
            <button
              onClick={toggleSidebar}
              title="Expand Dock"
              className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* POD 2: Sculpted Floating Navigation Capsule */}
      <nav className="liquid-glass rounded-[28px] p-2 lg:p-2.5 flex flex-col gap-1.5 shrink-0">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative flex items-center gap-3 rounded-2xl transition-colors w-11 h-11 mx-auto justify-center ${
                isSidebarExpanded
                  ? "lg:w-full lg:h-auto lg:mx-0 lg:justify-start lg:px-3.5 lg:py-2.5"
                  : ""
              } ${
                isActive
                  ? "text-white font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="desktop-liquid-nav-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-2xl ocean-gradient-btn z-0"
                />
              )}
              <Icon className="relative z-10 w-[18px] h-[18px] shrink-0" />
              {isSidebarExpanded && (
                <span className="hidden lg:inline relative z-10 text-sm tracking-tight">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* POD 3: Floating Liquid Playlist Orbs */}
      <div className="liquid-glass rounded-[28px] p-2.5 lg:p-3 flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
        <div
          className={`flex items-center justify-center shrink-0 ${
            isSidebarExpanded ? "lg:justify-between lg:px-1" : ""
          }`}
        >
          {isSidebarExpanded && (
            <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Ocean Mixes
            </span>
          )}
          <button
            onClick={() => setCreatePlaylistOpen(true)}
            title="Create Playlist"
            className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--accent-cyan)] hover:scale-105 transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1.5 px-1 py-1 -mx-1">
          {playlists.map((pl) => {
            const active = pathname === `/playlist/${pl.id}`;
            return (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                title={pl.name}
                className={`group flex items-center justify-center gap-3 rounded-2xl p-1.5 border transition-all shrink-0 ${
                  isSidebarExpanded ? "lg:justify-start" : ""
                } ${
                  active
                    ? "bg-[var(--glass-bg-hover)] border-[var(--accent-cyan)]/50"
                    : "border-transparent hover:bg-[var(--glass-bg-hover)]"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-[11px] font-bold shadow-md ring-2 ring-white/30 group-hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${pl.coverGradient.from}, ${pl.coverGradient.via}, ${pl.coverGradient.to})`,
                  }}
                >
                  {pl.name.slice(0, 2).toUpperCase()}
                </div>
                {isSidebarExpanded && (
                  <div className="hidden lg:block min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate text-[var(--text-primary)]">
                      {pl.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {pl.trackIds.length} songs
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
