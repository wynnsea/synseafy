import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/src/infrastructure/supabase/client";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  provider: "email" | "google";
}

/** "loading" until the stored session has been checked once on startup. */
export type AuthStatus = "loading" | "ready";

export type AuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string };

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;

  /** Subscribe to Supabase auth changes. Call once at app start; returns an unsubscribe. */
  init: () => () => void;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  updateProfileName: (name: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function callbackUrl(): string {
  return `${window.location.origin}${APP_ROUTES.authCallback}`;
}

/** Turn Supabase's English error codes into short, friendly messages. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("user already registered"))
    return "This email is already registered. Try signing in instead.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "Password is too weak. Use at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider"))
    return "Google sign-in isn't enabled yet.";
  return message;
}

/** Build the app user from the auth user + their row in public.profiles. */
async function loadUser(authUser: User): Promise<AuthUser> {
  const { data: profile } = await getSupabase()
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", authUser.id)
    .maybeSingle();

  const meta = authUser.user_metadata ?? {};
  const email = authUser.email ?? "";
  const name =
    profile?.display_name ||
    meta.display_name ||
    meta.full_name ||
    meta.name ||
    email.split("@")[0] ||
    "Listener";

  return {
    id: authUser.id,
    name,
    email,
    initials: getInitials(name),
    avatarUrl: profile?.avatar_url ?? meta.avatar_url ?? null,
    provider: authUser.app_metadata?.provider === "google" ? "google" : "email",
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "loading",

  init: () => {
    const supabase = getSupabase();

    const applySession = async (session: Session | null) => {
      if (!session?.user) {
        set({ user: null, status: "ready" });
        return;
      }
      // Skip the profile round-trip on token refreshes for the same user
      if (get().user?.id === session.user.id && get().status === "ready") return;
      const user = await loadUser(session.user);
      set({ user, status: "ready" });
    };

    // Fires once immediately with the stored session (INITIAL_SESSION), then on every change.
    // Supabase warns against awaiting other Supabase calls inside this callback, so defer them.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void applySession(session), 0);
    });

    return () => data.subscription.unsubscribe();
  },

  signInWithEmail: async (email, password) => {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? { ok: false, error: friendlyError(error.message) } : { ok: true };
  },

  registerWithEmail: async (name, email, password) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Read by the handle_new_user() trigger to fill profiles.display_name
        data: { display_name: name.trim() },
        emailRedirectTo: callbackUrl(),
      },
    });
    if (error) return { ok: false, error: friendlyError(error.message) };
    // With "Confirm email" on, Supabase returns a user but no session until the link is clicked
    return { ok: true, needsEmailConfirmation: !data.session };
  },

  signInWithGoogle: async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser navigates to Google, so there is nothing else to do here
    return error ? { ok: false, error: friendlyError(error.message) } : { ok: true };
  },

  updateProfileName: async (name) => {
    const user = get().user;
    const cleanName = name.trim();
    if (!user || !cleanName) return { ok: false, error: "Name can't be empty." };

    const { error } = await getSupabase()
      .from("profiles")
      .update({ display_name: cleanName })
      .eq("id", user.id);
    if (error) return { ok: false, error: friendlyError(error.message) };

    set({ user: { ...user, name: cleanName, initials: getInitials(cleanName) } });
    return { ok: true };
  },

  signOut: async () => {
    await getSupabase().auth.signOut();
    set({ user: null, status: "ready" });
  },
}));
