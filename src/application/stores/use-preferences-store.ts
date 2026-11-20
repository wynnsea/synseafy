import { create } from "zustand";
import type { UserSettings } from "@/src/domain/repositories/user-library-repository";
import { userLibraryRepository } from "@/src/infrastructure/repositories/supabase-user-library-repository";
import { persist } from "@/src/application/stores/user-data-sync";

type Preferences = Omit<UserSettings, "theme">;
type PreferenceKey = keyof Preferences;

const DEFAULTS: Preferences = {
  highQualityAudio: true,
  autoplaySimilar: true,
  ytmSync: false,
};

interface PreferencesState extends Preferences {
  hydrate: (prefs: Preferences) => void;
  reset: () => void;
  /** Flip one preference and save it. Only shown to signed-in users. */
  toggle: (key: PreferenceKey) => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULTS,

  hydrate: (prefs) => set(prefs),
  reset: () => set(DEFAULTS),

  toggle: (key) => {
    const next = !get()[key];
    set({ [key]: next } as Pick<Preferences, PreferenceKey>);
    persist(
      userLibraryRepository.updateSettings({ [key]: next }),
      "Couldn't save that setting. Please try again."
    );
    return next;
  },
}));
