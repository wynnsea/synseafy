"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useLibraryStore } from "@/src/application/stores/use-library-store";
import { useActivityStore } from "@/src/application/stores/use-activity-store";
import { useSearchStore } from "@/src/application/stores/use-search-store";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { usePreferencesStore } from "@/src/application/stores/use-preferences-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import { setUserDataReloader } from "@/src/application/stores/user-data-sync";
import { userLibraryRepository } from "@/src/infrastructure/repositories/supabase-user-library-repository";

const RECENT_LIMIT = 12;

function clearUserData(): void {
  useLibraryStore.getState().reset();
  useActivityStore.getState().reset();
  useSearchStore.getState().reset();
  usePreferencesStore.getState().reset();
}

/**
 * Loads the signed-in user's library, history, searches and settings into the
 * stores whenever the signed-in user changes, and clears them on sign-out.
 * Mount once (AppShell).
 */
export function useUserDataSync(): void {
  const userId = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!userId) {
      clearUserData();
      setUserDataReloader(null);
      return;
    }

    // Ignore results that arrive after the user changed (sign-out / switch account)
    let active = true;

    const load = async () => {
      try {
        const data = await userLibraryRepository.load(userId);
        if (!active) return;

        // Recently played = most recent distinct songs from history
        const recentTrackIds: string[] = [];
        for (const rec of data.history) {
          if (!recentTrackIds.includes(rec.trackId)) recentTrackIds.push(rec.trackId);
          if (recentTrackIds.length >= RECENT_LIMIT) break;
        }

        useLibraryStore.getState().hydrate({
          playlists: data.playlists,
          likedTrackIds: data.likedTrackIds,
          recentTrackIds,
        });
        useActivityStore.getState().hydrate(data.history);
        // A listen interrupted by closing the tab last time
        useActivityStore.getState().flushPendingListen();
        useSearchStore.getState().hydrate(data.recentSearches);
        useThemeStore.getState().hydrate(data.settings.theme);
        usePreferencesStore.getState().hydrate({
          highQualityAudio: data.settings.highQualityAudio,
          autoplaySimilar: data.settings.autoplaySimilar,
          ytmSync: data.settings.ytmSync,
        });
      } catch (err) {
        console.error(err);
        if (active) {
          useToastStore
            .getState()
            .showToast("Couldn't load your library. Check your connection.");
        }
      }
    };

    setUserDataReloader(() => void load());
    void load();

    return () => {
      active = false;
      setUserDataReloader(null);
      clearUserData();
    };
  }, [userId]);
}
