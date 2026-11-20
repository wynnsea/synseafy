/**
 * A listen that was still in progress when the page was hidden or closed.
 * It is stashed in localStorage and saved the next time the app loads, so
 * closing the tab mid-song doesn't lose the time already listened.
 *
 * localStorage can be unavailable (private mode, blocked storage), so every
 * access is wrapped and failures simply mean the in-progress listen is lost.
 */

const KEY = "synseafy-pending-listen";

export interface PendingListen {
  trackId: string;
  secondsListened: number;
  playedAt: string; // ISO
}

export function stashPendingListen(listen: PendingListen): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(listen));
  } catch {
    // storage unavailable: nothing to do
  }
}

export function clearPendingListen(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // storage unavailable: nothing to do
  }
}

/** Read and remove the stashed listen, if any. */
export function takePendingListen(): PendingListen | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    window.localStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as Partial<PendingListen>;
    if (
      typeof parsed.trackId === "string" &&
      typeof parsed.secondsListened === "number" &&
      typeof parsed.playedAt === "string"
    ) {
      return parsed as PendingListen;
    }
    return null;
  } catch {
    return null;
  }
}
