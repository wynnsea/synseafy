import { create } from "zustand";
import { usePathname } from "next/navigation";

/**
 * Shared optimistic tab state for the mobile pager + tab bar.
 *
 * When a swipe or tab tap starts a navigation, `pending.path` is shown
 * immediately (no bounce while the router settles). It is only honoured while
 * the URL is still the one it was started from, and it is cleared on every
 * pathname change, so a stale value can never point the pager at the wrong tab.
 */
interface TabPagerState {
  pending: { path: string; from: string } | null;
  setPending: (path: string, from: string) => void;
  clearPending: () => void;
}

export const useTabPagerStore = create<TabPagerState>((set) => ({
  pending: null,
  setPending: (path, from) =>
    set({ pending: path === from ? null : { path, from } }),
  clearPending: () => set({ pending: null }),
}));

/** The tab path that should be displayed right now (optimistic). */
export function useActiveTabPath(): string {
  const pathname = usePathname();
  const pending = useTabPagerStore((s) => s.pending);
  return pending && pending.from === pathname ? pending.path : pathname;
}
