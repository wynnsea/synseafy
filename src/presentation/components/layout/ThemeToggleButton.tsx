"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/src/application/stores/use-theme-store";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark or Light Theme"
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      className="w-10 h-10 rounded-full liquid-pill flex items-center justify-center text-[var(--text-primary)] hover:scale-105 transition-transform cursor-pointer shrink-0"
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px] text-sky-300" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-sky-600" />
      )}
    </button>
  );
}
