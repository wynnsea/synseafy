"use client";

import { useEffect } from "react";
import {
  BeforeInstallPromptEvent,
  usePwaStore,
} from "@/src/application/stores/use-pwa-store";

export function PwaRegistrar() {
  const setDeferredPrompt = usePwaStore((s) => s.setDeferredPrompt);
  const setInstalled = usePwaStore((s) => s.setInstalled);

  useEffect(() => {
    // Detect if already running as installed standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        Boolean((window.navigator as { standalone?: boolean }).standalone));
    if (isStandalone) {
      setInstalled(true);
    }

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
          // Ignore registration errors in unsupported contexts
        });
      } else {
        // In development, unregister any stale SW & clear old caches so Turbopack HMR never breaks
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            registrations.forEach((reg) => reg.unregister());
          })
          .catch(() => {});
        if ("caches" in window) {
          caches
            .keys()
            .then((keys) => keys.forEach((key) => caches.delete(key)))
            .catch(() => {});
        }
      }
    }

    // Capture browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [setDeferredPrompt, setInstalled]);

  return null;
}
