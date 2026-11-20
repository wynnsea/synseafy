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
  Camera,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useActivityStore } from "@/src/application/stores/use-activity-store";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { usePreferencesStore } from "@/src/application/stores/use-preferences-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";
import { TopHeader } from "@/src/presentation/components/layout/TopHeader";
import { UserAvatar } from "@/src/presentation/components/ui/UserAvatar";
import { ImagePickerButton } from "@/src/presentation/components/ui/ImagePickerButton";
import { InstallAppRow } from "@/src/presentation/components/pwa/InstallAppRow";

export function ProfileView() {
  const {
    user,
    status,
    updateProfileName,
    updateAvatar,
    removeAvatar,
    signOut,
  } = useAuthStore();
  const [avatarBusy, setAvatarBusy] = useState(false);

  const changeAvatar = async (file: File) => {
    setAvatarBusy(true);
    const result = await updateAvatar(file);
    setAvatarBusy(false);
    showToast(result.ok ? "Profile photo updated" : result.error);
  };

  const clearAvatar = async () => {
    setAvatarBusy(true);
    const result = await removeAvatar();
    setAvatarBusy(false);
    showToast(result.ok ? "Profile photo removed" : result.error);
  };
  const { likedTrackIds, playlists } = useLibraryStore();
  const records = useActivityStore((s) => s.records);
  const { theme, toggleTheme } = useThemeStore();
  const showToast = useToastStore((s) => s.showToast);

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const { highQualityAudio, autoplaySimilar, ytmSync, toggle } =
    usePreferencesStore();

  const startEditName = () => {
    setDraftName(user?.name ?? "");
    setEditingName(true);
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;
    const result = await updateProfileName(draftName);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setEditingName(false);
    showToast("Profile name updated");
  };

  // Still restoring the saved session: show a placeholder instead of flashing "sign in"
  if (status === "loading") {
    return (
      <div className="w-full max-w-[1440px] mx-auto">
        <TopHeader title="Profile & Account" subtitle="Loading your account" />
        <div className="px-4 md:px-7 space-y-6 pb-6">
          <div className="liquid-glass-strong rounded-[32px] h-32 animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            <div className="liquid-glass rounded-[24px] h-24 animate-pulse" />
            <div className="liquid-glass rounded-[24px] h-24 animate-pulse" />
            <div className="liquid-glass rounded-[24px] h-24 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Not signed in: no profile data at all, just ask the user to sign in
  if (!user) {
    return (
      <div className="w-full max-w-[1440px] mx-auto">
        <TopHeader
          title="Profile & Account"
          subtitle="Personalize your Synseafy experience"
        />

        <div className="px-4 md:px-7 pb-6 flex justify-center">
          <section className="w-full max-w-md liquid-glass-strong rounded-[32px] px-6 py-8 flex flex-col items-center text-center gap-4 mt-6 md:mt-12">
            <div className="w-20 h-20 rounded-full liquid-pill p-4 flex items-center justify-center">
              <Image
                src="/brand/logo-v3.png"
                alt="Synseafy"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                Sign in to view your profile
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                Your account, listening stats, recap, and preferences are
                available after you sign in.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-2">
              <Link
                href={APP_ROUTES.login}
                className="w-full py-3 rounded-full ocean-gradient-btn text-sm font-semibold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href={APP_ROUTES.register}
                className="w-full py-3 rounded-full liquid-pill text-sm font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 hover:bg-[var(--glass-bg-hover)]"
              >
                <UserPlus className="w-4 h-4 text-[var(--accent-cyan)]" />
                Create Account
              </Link>
            </div>
            <InstallAppRow className="w-full -mb-2" />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <TopHeader
        title="Profile & Account"
        subtitle={`Signed in as ${user.name} · Wynnsea Ecosystem`}
      />

      <div className="px-4 md:px-7 space-y-6 pb-6">
        {/* Account Hero Card */}
        <section className="liquid-glass-strong rounded-[32px] p-6 flex items-center gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              {/* Tap the photo to change it */}
              <ImagePickerButton
                onPick={changeAvatar}
                disabled={avatarBusy}
                label="Change profile photo"
                className="group relative rounded-full shadow-xl cursor-pointer disabled:cursor-wait"
              >
                <UserAvatar
                  user={user}
                  className="w-16 h-16 sm:w-20 sm:h-20 text-lg md:text-2xl text-white"
                />
                <span
                  className={`absolute inset-0 rounded-full bg-black/45 flex items-center justify-center transition-opacity ${
                    avatarBusy
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {avatarBusy ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </span>
                {/* Always-visible hint on touch screens */}
                <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full ocean-gradient-btn flex items-center justify-center ring-2 ring-[var(--bg-canvas)] sm:hidden">
                  <Camera className="w-3 h-3 text-white" />
                </span>
              </ImagePickerButton>
              {user.avatarUrl && !avatarBusy && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="text-[10px] font-medium text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
                >
                  Remove photo
                </button>
              )}
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
                  <h2 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] truncate">
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
        </section>

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

            <InstallAppRow />
          </div>
        </section>

        {/* Account Preferences */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
            Account Preferences
          </h3>
          <div className="liquid-glass rounded-[28px] p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                showToast(
                  toggle("highQualityAudio")
                    ? "High Quality Audio enabled"
                    : "Standard Audio enabled",
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
                showToast(
                  toggle("autoplaySimilar")
                    ? "Autoplay similar tracks enabled"
                    : "Autoplay disabled",
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
                showToast(
                  toggle("ytmSync")
                    ? "YouTube Music Sync ready (UI preview)"
                    : "YouTube Music Sync paused",
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

        {/* Sign Out — kept at the bottom, away from everyday actions */}
        <button
          type="button"
          onClick={() => {
            void signOut().then(() => showToast("Signed out of Synseafy"));
          }}
          className="w-full py-3.5 rounded-[22px] liquid-glass text-sm font-semibold text-rose-400 hover:bg-rose-500/15 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
