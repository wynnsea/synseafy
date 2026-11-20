"use client";

import React, { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogIn, Heart } from "lucide-react";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { ThemeToggleButton } from "@/src/presentation/components/layout/ThemeToggleButton";
import { HeaderSearch } from "@/src/presentation/components/layout/HeaderSearch";

const noopSubscribe = () => () => {};

/** Client-only (server renders "Hi") so the greeting uses the listener's local time. */
function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";
import { ProfileMenu } from "@/src/presentation/components/layout/ProfileMenu";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
}

export function TopHeader({
  title = "Hi, Wynnsea",
  subtitle = "Deep ocean soundscape ready",
}: TopHeaderProps) {
  const user = useAuthStore((s) => s.user);

  const pathname = usePathname();
  const greeting = useSyncExternalStore(noopSubscribe, timeOfDayGreeting, () => "Hi");

  // "Hi, Wynnsea" is the home greeting: time of day + first name (or neutral for guests)
  const firstName = user?.name.split(/\s+/)[0];
  const resolvedTitle =
    title === "Hi, Wynnsea"
      ? firstName
        ? `${greeting}, ${firstName}`
        : greeting === "Hi"
          ? "Hi there"
          : greeting
      : title;
  // The Search page has its own big search box
  const showHeaderSearch = pathname !== APP_ROUTES.search;

  return (
    <header className="@container sticky top-0 z-30 pt-4 pb-5 px-4 md:px-7 bg-gradient-to-b from-[var(--bg-canvas)] via-[var(--bg-canvas)]/92 to-transparent">
      {/* With the search box: a balanced 3-column grid (title | search | actions) so the
          search sits in the true centre. Without it: a simple space-between row. */}
      <div
        className={`liquid-glass-bar liquid-glass-solid rounded-full px-3.5 py-2.5 md:pl-6 md:pr-3 md:py-3 xl:pr-6 flex items-center justify-between gap-3 md:gap-5 ${
          showHeaderSearch
            ? "@2xl:grid @2xl:grid-cols-[minmax(auto,1fr)_minmax(0,2fr)_minmax(auto,1fr)]"
            : ""
        }`}
      >
        {/* Left: Avatar + Personal Greeting */}
        <Link
          href={user ? APP_ROUTES.profile : APP_ROUTES.login}
          className="flex items-center gap-3 min-w-0 shrink group"
          title={user ? `${user.name} (${user.email})` : "Sign in to Synseafy"}
        >
          <div className="md:hidden w-10 h-10 rounded-full liquid-pill p-1.5 shrink-0 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
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
              {subtitle}
            </p>
          </div>
        </Link>

        {/* Middle: quick search. Sized by the header's own width (container query),
            since the sidebar, right column or drawer can make it much narrower than the screen */}
        {showHeaderSearch && (
          <div className="hidden @2xl:flex min-w-0 justify-center">
            <HeaderSearch />
          </div>
        )}

        {/* Right: Theme Toggle + Sign In (guest) / Liked (mobile) + Account menu (md+) */}
        {/* On xl these live in the right column's account pod */}
        <div className="flex items-center justify-end gap-2 shrink-0 justify-self-end xl:hidden">
          <ThemeToggleButton />

          {user ? (
            <>
              {/* Mobile: quick Liked shortcut (sidebar has it on larger screens) */}
              <Link
                href={APP_ROUTES.liked}
                title="Liked Songs"
                aria-label="Liked Songs"
                className="md:hidden w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--accent-cyan)] hover:scale-105 transition-transform"
              >
                <Heart className="w-[18px] h-[18px] fill-current" />
              </Link>
              <div className="hidden md:block">
                <ProfileMenu />
              </div>
            </>
          ) : (
            <Link
              href={APP_ROUTES.login}
              title="Sign In"
              className="h-10 px-3.5 rounded-full liquid-pill flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors"
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
