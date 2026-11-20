"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, LogIn, LogOut } from "lucide-react";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
}

export function TopHeader({
  title = "Hi, Wynnsea",
  subtitle = "Deep ocean soundscape ready",
}: TopHeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();

  const resolvedTitle =
    user && title === "Hi, Wynnsea" ? `Hi, ${user.name}` : title;

  return (
    <header className="sticky top-0 z-30 pt-4 pb-5 px-4 md:px-7 bg-gradient-to-b from-[var(--bg-canvas)] via-[var(--bg-canvas)]/92 to-transparent">
      <div className="liquid-glass-dock rounded-full px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Avatar + Personal Greeting */}
        <Link
          href={user ? APP_ROUTES.home : APP_ROUTES.login}
          className="flex items-center gap-3 min-w-0 group"
          title={user ? `${user.name} (${user.email})` : "Sign in to Synseafy"}
        >
          <div className="w-10 h-10 rounded-full liquid-pill p-1.5 shrink-0 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
            {user ? (
              <span className="text-xs font-bold text-[var(--accent-cyan)]">
                {user.initials}
              </span>
            ) : (
              <Image
                src="/brand/logo-v3.png"
                alt="Synseafy"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] md:text-base font-semibold tracking-tight text-[var(--text-primary)] truncate">
              {resolvedTitle}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] truncate hidden sm:block">
              {user ? user.email : subtitle}
            </p>
          </div>
        </Link>

        {/* Right: Single-Purpose Header Actions (Theme + Auth only) */}
        <div className="flex items-center gap-2 shrink-0">
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

          {user ? (
            <button
              onClick={signOut}
              title="Sign Out"
              className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={APP_ROUTES.login}
              title="Sign In"
              className="h-10 px-3.5 rounded-full liquid-pill flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
