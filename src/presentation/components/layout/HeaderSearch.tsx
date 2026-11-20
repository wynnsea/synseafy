"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useSearchStore } from "@/src/application/stores/use-search-store";
import { APP_ROUTES } from "@/src/infrastructure/config/app-config";

/**
 * Compact search box for the desktop/tablet header. Enter opens the Search page
 * with the query already applied; "/" anywhere focuses it.
 */
export function HeaderSearch() {
  const router = useRouter();
  const setQuery = useSearchStore((s) => s.setQuery);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // Only the visible copy (each page renders its own header)
      if (!inputRef.current?.offsetParent) return;
      e.preventDefault();
      inputRef.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(draft.trim());
        router.push(APP_ROUTES.search);
      }}
      className="relative w-full max-w-[360px]"
    >
      <Search className="w-4 h-4 text-[var(--accent-cyan)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search songs, artists, albums"
        aria-label="Search"
        className="w-full h-10 liquid-pill rounded-full pl-10 pr-10 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-400/60 [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-[var(--glass-border-side)] text-[10px] font-semibold text-[var(--text-muted)] pointer-events-none">
        /
      </kbd>
    </form>
  );
}
