"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Clock,
  Disc3,
  LogIn,
  LogOut,
  UserPlus,
  ChevronRight,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Check,
  Pencil,
  Radio,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useActivityStore } from "@/src/application/stores/use-activity-store";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";

export function ProfileView() {
  const { user, updateProfileName, signOut } = useAuthStore();
  const { likedTrackIds, playlists } = useLibraryStore();
  const records = useActivityStore((s) => s.records);
  const { theme, toggleTheme } = useThemeStore();
  const showToast = useToastStore((s) => s.showToast);

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [highQualityAudio, setHighQualityAudio] = useState(true);
  const [autoplaySimilar, setAutoplaySimilar] = useState(true);
  const [ytmSync, setYtmSync] = useState(false);

  const startEditName = () => {
    setDraftName(user?.name ?? "");
    setEditingName(true);
  };

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;
    updateProfileName(draftName);
    setEditingName(false);
    showToast("Profile name updated");
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Profile & Account"
        subtitle={
          user
            ? `Signed in as ${user.name} · Wynnsea Ecosystem`
            : "Personalize your Synseafy experience"
        }
      />

      <div className="px-4 md:px-7 space-y-6 pb-6">
        {/* Account Hero Card */}
        {user ? (
          <section className="liquid-glass-strong rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ocean-gradient-btn flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0 shadow-xl">
                {user.initials}
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full liquid-pill text-[11px] font-semibold text-[var(--accent-cyan)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.provider === "google"
                    ? "Google Account"
                    : "Wynnsea Member"}
                </span>

                {editingName ? (
                  <form
                    onSubmit={saveName}
                    className="flex items-center gap-2 mt-2"
                  >
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      autoFocus
                      className="liquid-pill rounded-full px-3.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-400/60 w-44"
                    />
                    <button
                      type="submit"
                      className="w-8 h-8 rounded-full ocean-gradient-btn flex items-center justify-center cursor-pointer"
                      aria-label="Save name"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 mt-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
                      {user.name}
                    </h2>
                    <button
                      onClick={startEditName}
                      title="Edit display name"
                      className="w-7 h-7 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                signOut();
                showToast("Signed out of Synseafy");
              }}
              className="self-start sm:self-center px-4 py-2.5 rounded-full liquid-pill text-xs font-semibold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </section>
        ) : (
          /* Guest Card prompting Sign In / Register */
          <section className="liquid-glass-strong rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full liquid-pill p-3 flex items-center justify-center shrink-0">
                <Image
                  src="/brand/logo-v3.png"
                  alt="Synseafy"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Guest Mode
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                  Sign in to unlock account settings, profile customization, and
                  cloud sync.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href={APP_ROUTES.login}
                className="px-5 py-2.5 rounded-full ocean-gradient-btn text-xs font-semibold flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href={APP_ROUTES.register}
                className="px-4 py-2.5 rounded-full liquid-pill text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 hover:bg-[var(--glass-bg-hover)]"
              >
                <UserPlus className="w-4 h-4 text-[var(--accent-cyan)]" />
                Register
              </Link>
            </div>
          </section>
        )}

        {/* Listening Summary Stats */}
        <section className="grid grid-cols-3 gap-3">
          <Link
            href={APP_ROUTES.liked}
            className="liquid-glass rounded-[24px] p-4 flex flex-col items-center text-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <Heart className="w-5 h-5 text-[var(--accent-cyan)]" />
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {likedTrackIds.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Liked Songs
            </span>
          </Link>

          <Link
            href={APP_ROUTES.library}
            className="liquid-glass rounded-[24px] p-4 flex flex-col items-center text-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <Disc3 className="w-5 h-5 text-[var(--accent-cyan)]" />
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {playlists.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Playlists
            </span>
          </Link>

          <Link
            href={APP_ROUTES.recap}
            className="liquid-glass rounded-[24px] p-4 flex flex-col items-center text-center gap-1.5 hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <Clock className="w-5 h-5 text-[var(--accent-cyan)]" />
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {records.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Total Plays
            </span>
          </Link>
        </section>

        {/* Featured Listening Recap & Poster Card */}
        <Link
          href={APP_ROUTES.recap}
          className="group liquid-glass-strong rounded-[28px] p-5 flex items-center justify-between gap-4 hover:bg-[var(--glass-bg-hover)] transition-all"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl ocean-gradient-btn flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
                Listening Recap &amp; Poster
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                Play records, peak listening hours &amp; downloadable HD poster
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--accent-cyan)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Quick Collection Shortcuts */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
            Your Collection
          </h3>
          <div className="liquid-glass rounded-[28px] p-2 space-y-1">
            <Link
              href={APP_ROUTES.liked}
              className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                <Heart className="w-4 h-4 text-[var(--accent-cyan)]" />
                Liked Songs &amp; Listening History
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-sky-300" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-600" />
                )}
                Appearance
              </span>
              <span className="text-xs font-semibold text-[var(--accent-cyan)]">
                {theme === "dark" ? "Deep Ocean Dark" : "Light Sea Glass"}
              </span>
            </button>
          </div>
        </section>

        {/* Account-Only Menu (Unlocked after Login) */}
        {user && (
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
              Account Preferences
            </h3>
            <div className="liquid-glass rounded-[28px] p-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setHighQualityAudio((v) => !v);
                  showToast(
                    !highQualityAudio
                      ? "High Quality Audio enabled"
                      : "Standard Audio enabled"
                  );
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                  <Sliders className="w-4 h-4 text-[var(--accent-cyan)]" />
                  High Quality Audio Stream
                </span>
                <span
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                    highQualityAudio
                      ? "ocean-gradient-btn justify-end"
                      : "liquid-pill justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAutoplaySimilar((v) => !v);
                  showToast(
                    !autoplaySimilar
                      ? "Autoplay similar tracks enabled"
                      : "Autoplay disabled"
                  );
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                  <Radio className="w-4 h-4 text-[var(--accent-cyan)]" />
                  Autoplay Similar Ocean Tracks
                </span>
                <span
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                    autoplaySimilar
                      ? "ocean-gradient-btn justify-end"
                      : "liquid-pill justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setYtmSync((v) => !v);
                  showToast(
                    !ytmSync
                      ? "YouTube Music Sync ready (UI preview)"
                      : "YouTube Music Sync paused"
                  );
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                  <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
                  YouTube Music Personal Sync
                </span>
                <span
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                    ytmSync
                      ? "ocean-gradient-btn justify-end"
                      : "liquid-pill justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
