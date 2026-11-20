import { create } from "zustand";

export type DrawerTab = "lyrics" | "queue" | null;

interface UiState {
  isSidebarExpanded: boolean;
  isNowPlayingOpen: boolean;
  activeDrawer: DrawerTab;
  isCreatePlaylistOpen: boolean;

  toggleSidebar: () => void;
  setNowPlayingOpen: (open: boolean) => void;
  setActiveDrawer: (tab: DrawerTab) => void;
  toggleDrawer: (tab: Exclude<DrawerTab, null>) => void;
  setCreatePlaylistOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarExpanded: true,
  isNowPlayingOpen: false,
  activeDrawer: null,
  isCreatePlaylistOpen: false,

  toggleSidebar: () =>
    set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setNowPlayingOpen: (open) => set({ isNowPlayingOpen: open }),
  setActiveDrawer: (tab) => set({ activeDrawer: tab }),
  toggleDrawer: (tab) =>
    set((state) => ({
      activeDrawer: state.activeDrawer === tab ? null : tab,
    })),
  setCreatePlaylistOpen: (open) => set({ isCreatePlaylistOpen: open }),
}));
