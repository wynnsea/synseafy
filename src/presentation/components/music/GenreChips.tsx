"use client";

import React from "react";

interface GenreChipsProps {
  genres: string[];
  selected: string;
  onSelect: (genre: string) => void;
}

export function GenreChips({ genres, selected, onSelect }: GenreChipsProps) {
  return (
    // Full-bleed: cancel the page gutter so chips scroll edge-to-edge,
    // with vertical room so the glass shadows are never clipped.
    <div className="-mx-4 md:-mx-7 -my-2 overflow-x-auto no-scrollbar">
      <div className="flex w-max items-center gap-2.5 px-4 md:px-7 py-2">
      {genres.map((genre) => {
        const active = selected === genre;
        return (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            style={{
              boxShadow: active
                ? "inset 0 1px 0 rgba(255, 255, 255, 0.65)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.25)",
            }}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${active
              ? "ocean-gradient-btn font-semibold"
              : "liquid-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
              }`}
          >
            {genre}
          </button>
        );
      })}
      </div>
    </div>
  );
}
