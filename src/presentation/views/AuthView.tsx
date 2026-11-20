"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useThemeStore } from "@/src/application/stores/use-theme-store";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";

interface AuthViewProps {
  mode: "login" | "register";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.51 5.51 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.57-5.15 3.57-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.3a7.18 7.18 0 0 1 0-4.6V6.6H1.28a12 12 0 0 0 0 10.8l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4 3.1c.95-2.84 3.6-4.95 6.72-4.95z"
      />
    </svg>
  );
}

export function AuthView({ mode }: AuthViewProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { signInWithEmail, registerWithEmail, signInWithGoogle } =
    useAuthStore();

  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in your email and password.");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Please enter your display name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setBusy("email");
    const result = isLogin
      ? await signInWithEmail(email, password)
      : await registerWithEmail(name, email, password);
    setBusy(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setNotice(
        `Almost there! We sent a confirmation link to ${email.trim()}. Open it to activate your account.`
      );
      return;
    }
    router.push(APP_ROUTES.home);
  };

  const handleGoogleAuth = async () => {
    if (busy) return;
    setError("");
    setNotice("");
    setBusy("google");
    const result = await signInWithGoogle();
    // On success the browser is already leaving for Google
    if (!result.ok) {
      setBusy(null);
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6">
      {/* Top Floating Bar: Back to Player + Theme Toggle */}
      <div className="w-full max-w-[1100px] mx-auto flex items-center justify-between">
        <Link
          href={APP_ROUTES.home}
          className="liquid-pill rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--accent-cyan)]" />
          <span>Back to Player</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:scale-105 transition-transform cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-[18px] h-[18px] text-sky-300" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-sky-600" />
          )}
        </button>
      </div>

      {/* Center Liquid Glass Auth Card */}
      <div className="w-full max-w-[430px] mx-auto my-8">
        <div className="liquid-glass-strong rounded-[34px] p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center gap-2.5">
            <div className="w-16 h-16 rounded-[24px] liquid-pill p-2.5 flex items-center justify-center shadow-lg">
              <Image
                src="/brand/logo-v3.png"
                alt="Synseafy Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(56,189,248,0.5)]"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {isLogin ? "Welcome Back" : "Join Synseafy"}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                {isLogin
                  ? "Sign in to sync your personal Wynnsea ocean mixes"
                  : "Create your personal liquid glass music space"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full liquid-pill text-[11px] font-medium text-[var(--accent-cyan)]">
              music.wynnsea.my.id
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={busy !== null}
            className="w-full disabled:opacity-60 disabled:pointer-events-none liquid-pill rounded-full py-3.5 px-5 flex items-center justify-center gap-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            {busy === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-cyan)]" />
            ) : (
              <GoogleIcon />
            )}
            <span>
              {isLogin ? "Continue with Google" : "Sign up with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--text-muted)]/25" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              or with email
            </span>
            <div className="h-px flex-1 bg-[var(--text-muted)]/25" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div className="relative">
                <User className="w-4 h-4 text-[var(--accent-cyan)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  autoComplete="name"
                  className="w-full liquid-pill rounded-full pl-11 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--accent-cyan)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="w-full liquid-pill rounded-full pl-11 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--accent-cyan)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full liquid-pill rounded-full pl-11 pr-11 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--accent-cyan)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="w-full liquid-pill rounded-full pl-11 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between px-1 pt-0.5 text-xs">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-sky-400 rounded cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError("Password reset will connect to backend later.")
                  }
                  className="text-[var(--accent-cyan)] font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-rose-400 text-center px-2">
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="text-xs text-[var(--accent-cyan)] text-center px-2 leading-relaxed"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy !== null}
              className="w-full disabled:opacity-60 disabled:pointer-events-none mt-2 py-3.5 px-6 rounded-full ocean-gradient-btn text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
            >
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              {busy === "email" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Switch between Login / Register */}
          <p className="text-center text-xs text-[var(--text-secondary)]">
            {isLogin ? "New to Synseafy?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? APP_ROUTES.register : APP_ROUTES.login}
              className="font-semibold text-[var(--accent-cyan)] hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>

      {/* Subtle Footer */}
      <p className="text-center text-[11px] text-[var(--text-muted)]">
        Synseafy · Wynnsea Ecosystem
      </p>
    </div>
  );
}
