"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Download, ChevronRight } from "lucide-react";
import { usePwaStore } from "@/src/application/stores/use-pwa-store";

const noopSubscribe = () => () => {};

/** iPhone/iPad Safari never fires `beforeinstallprompt`; install is manual there. */
function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
}

/**
 * "Install Synseafy" row for the Profile page. Uses the browser's install
 * prompt when available, otherwise shows how to add it manually.
 * Hidden once the app is installed.
 */
export function InstallAppRow({ className = "" }: { className?: string }) {
  const deferredPrompt = usePwaStore((s) => s.deferredPrompt);
  const isInstalled = usePwaStore((s) => s.isInstalled);
  const promptInstall = usePwaStore((s) => s.promptInstall);
  const ios = useSyncExternalStore(noopSubscribe, isIos, () => false);
  const [showHelp, setShowHelp] = useState(false);

  if (isInstalled) return null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => (deferredPrompt ? void promptInstall() : setShowHelp((v) => !v))}
        className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
          <Download className="w-4 h-4 text-[var(--accent-cyan)]" />
          Install Synseafy
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--accent-cyan)]">
          {deferredPrompt ? "Install" : "How to"}
          <ChevronRight
            className={`w-4 h-4 transition-transform ${showHelp ? "rotate-90" : ""}`}
          />
        </span>
      </button>

      {showHelp && !deferredPrompt && (
        <p className="px-3.5 pb-3 pt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          {ios
            ? "In Safari, tap the Share button, then “Add to Home Screen”."
            : "Open your browser menu (⋮) and choose “Install app” or “Add to Home screen”."}
        </p>
      )}
    </div>
  );
}
