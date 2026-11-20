"use client";

import React from "react";
import Link from "next/link";
import { Play, Music2 } from "lucide-react";
import { Playlist } from "@/src/domain/entities/playlist";

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group liquid-glass rounded-[28px] p-4 flex flex-col gap-3.5 transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className="relative aspect-[16/10] w-full rounded-[20px] overflow-hidden flex items-end p-3.5"
        style={{
          background: `linear-gradient(135deg, ${playlist.coverGradient.from}, ${playlist.coverGradient.via}, ${playlist.coverGradient.to})`,
        }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.45), transparent 55%)",
          }}
        />
        <span className="relative z-10 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/30 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5">
          <Music2 className="w-3 h-3" />
          {playlist.trackIds.length} songs
        </span>

        <div className="absolute right-3 bottom-3 w-10 h-10 rounded-full ocean-gradient-btn flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform">
          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
        </div>
      </div>

      <div className="px-0.5">
        <h3 className="text-base font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)] transition-colors">
          {playlist.name}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
          {playlist.description}
        </p>
      </div>
    </Link>
  );
}
