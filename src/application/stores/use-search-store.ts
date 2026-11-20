import { create } from "zustand";

interface SearchState {
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  recentSearches: ["Wynnsea Collective", "Cobalt Tide", "Ocean Chill", "Lo-Fi"],

  addRecentSearch: (term) => {
    const clean = term.trim();
    if (!clean) return;
    set((state) => ({
      recentSearches: [
        clean,
        ...state.recentSearches.filter(
          (item) => item.toLowerCase() !== clean.toLowerCase()
        ),
      ].slice(0, 6),
    }));
  },

  removeRecentSearch: (term) =>
    set((state) => ({
      recentSearches: state.recentSearches.filter((item) => item !== term),
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),
}));
