import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Written out in full (not process.env[name]) so Next can inline them into the browser bundle.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

let browserClient: SupabaseClient | null = null;

/**
 * Browser Supabase client carrying the signed-in user's session.
 * Uses the publishable key: what each user can read/write is enforced by
 * Row Level Security in the database, not by this code.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set."
    );
  }
  browserClient ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      // Exchanges the ?code= from Google / email confirmation links automatically
      detectSessionInUrl: true,
      storageKey: "synseafy-auth",
    },
  });
  return browserClient;
}
