"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";

const GIVE_UP_AFTER_MS = 12000;

const noopSubscribe = () => () => {};

function readUrlError(): string {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("error_description") ?? hash.get("error_description") ?? "";
}

/**
 * Landing page for Google sign-in and email confirmation links.
 * The Supabase client exchanges the ?code= in the URL for a session on its own
 * (detectSessionInUrl); this page just waits for the user to appear, then goes home.
 */
export function AuthCallbackView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Errors come back as ?error_description=... (or in the #hash for some flows).
  // Read through useSyncExternalStore so the server render ("") and the first
  // client render agree, avoiding a hydration mismatch.
  const urlError = useSyncExternalStore(
    noopSubscribe,
    readUrlError,
    () => ""
  );
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (user) router.replace(APP_ROUTES.home);
  }, [user, router]);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), GIVE_UP_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const failed = Boolean(urlError) || (timedOut && !user);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] liquid-glass-strong rounded-[32px] p-8 flex flex-col items-center text-center gap-4">
        {failed ? (
          <>
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Sign-in didn&apos;t finish
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {urlError ||
                  "The link may have expired or was already used. Please try again."}
              </p>
            </div>
            <Link
              href={APP_ROUTES.login}
              className="w-full py-3 rounded-full ocean-gradient-btn text-sm font-semibold flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="w-9 h-9 text-[var(--accent-cyan)] animate-spin" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Signing you in…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
