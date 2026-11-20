import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";

/**
 * Small helpers shared by the stores that mirror the signed-in user's data
 * (library, activity, searches, settings).
 *
 * Stores update their local state first so the UI feels instant, then call
 * `persist()` to save to Supabase in the background. If saving fails, the
 * user's data is reloaded from the server so the screen matches what's stored.
 */

let reloadUserData: (() => void) | null = null;

/** Registered by the sync hook so a failed save can trigger a fresh load. */
export function setUserDataReloader(fn: (() => void) | null): void {
  reloadUserData = fn;
}

export function isSignedIn(): boolean {
  return useAuthStore.getState().user !== null;
}

/** Returns false (and tells the user why) when an action needs an account. */
export function requireSignIn(message: string): boolean {
  if (isSignedIn()) return true;
  useToastStore.getState().showToast(message);
  return false;
}

export function persist(task: Promise<unknown>, failMessage: string): void {
  task.catch((err: unknown) => {
    console.error(err);
    useToastStore.getState().showToast(failMessage);
    reloadUserData?.();
  });
}
