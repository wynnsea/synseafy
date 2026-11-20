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

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Ignore registration errors in unsupported contexts
      });
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
