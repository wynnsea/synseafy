import { create } from "zustand";
import { userLibraryRepository } from "@/src/infrastructure/repositories/supabase-user-library-repository";
import { isSignedIn, persist } from "@/src/application/stores/user-data-sync";

const LIMIT = 6;

interface SearchState {
  /** Current search text, shared by the header search box and the Search page. */
  query: string;
  setQuery: (query: string) => void;
  recentSearches: string[];
  hydrate: (recentSearches: string[]) => void;
  reset: () => void;
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

/** Guests keep recent searches in memory; signed-in users also save them. */
export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  setQuery: (query) => set({ query }),
  recentSearches: [],

  hydrate: (recentSearches) => set({ recentSearches }),
  reset: () => set({ recentSearches: [] }),

  addRecentSearch: (term) => {
    const clean = term.trim();
    if (!clean) return;
    // Same search with different casing replaces the old entry
    const duplicate = get().recentSearches.find(
      (item) => item.toLowerCase() === clean.toLowerCase()
    );
    set((state) => ({
      recentSearches: [
        clean,
        ...state.recentSearches.filter((item) => item !== duplicate),
      ].slice(0, LIMIT),
    }));
    if (!isSignedIn()) return;
    const save = async () => {
      if (duplicate && duplicate !== clean) {
        await userLibraryRepository.removeRecentSearch(duplicate);
      }
      await userLibraryRepository.addRecentSearch(clean);
    };
    persist(save(), "Couldn't save your search.");
  },

  removeRecentSearch: (term) => {
    set((state) => ({
      recentSearches: state.recentSearches.filter((item) => item !== term),
    }));
    if (isSignedIn()) {
      persist(
        userLibraryRepository.removeRecentSearch(term),
        "Couldn't remove that search."
      );
    }
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    if (isSignedIn()) {
      persist(
        userLibraryRepository.clearRecentSearches(),
        "Couldn't clear your searches."
      );
    }
  },
}));
