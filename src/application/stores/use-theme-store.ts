import { create } from "zustand";
import type { ThemeMode } from "@/src/domain/repositories/user-library-repository";
import { userLibraryRepository } from "@/src/infrastructure/repositories/supabase-user-library-repository";
import { isSignedIn, persist } from "@/src/application/stores/user-data-sync";

export type { ThemeMode };

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  /** Apply the theme saved in the user's settings without saving it back. */
  hydrate: (theme: ThemeMode) => void;
}

function save(theme: ThemeMode): void {
  if (!isSignedIn()) return;
  persist(
    userLibraryRepository.updateSettings({ theme }),
    "Couldn't save your theme."
  );
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    set({ theme });
    save(theme);
  },
  setTheme: (theme) => {
    set({ theme });
    save(theme);
  },
  hydrate: (theme) => set({ theme }),
}));
