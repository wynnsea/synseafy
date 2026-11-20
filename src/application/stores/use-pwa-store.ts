import { create } from "zustand";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  setDeferredPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
  promptInstall: () => Promise<void>;
}

export const usePwaStore = create<PwaState>((set, get) => ({
  deferredPrompt: null,
  isInstalled: false,

  setDeferredPrompt: (event) => set({ deferredPrompt: event }),
  setInstalled: (installed) => set({ isInstalled: installed }),

  promptInstall: async () => {
    const promptEvent = get().deferredPrompt;
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      set({ deferredPrompt: null, isInstalled: true });
    }
  },
}));
