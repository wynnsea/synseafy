"use client";

import React from "react";
import { Track } from "@/src/domain/entities/track";

interface TrackArtworkProps {
  track: Track;
  className?: string;
  rounded?: "full" | "2xl" | "3xl" | "xl";
  spinning?: boolean;
  showCenterHole?: boolean;
}

export function TrackArtwork({
  track,
  className = "w-14 h-14",
  rounded = "2xl",
  spinning,
  showCenterHole = false,
}: TrackArtworkProps) {
  const { from, via, to, accent, pattern } = track.artworkStyle;
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "3xl"
        ? "rounded-3xl"
        : rounded === "xl"
          ? "rounded-xl"
          : "rounded-2xl";

  const isRotatable = typeof spinning === "boolean";

  return (
    <div
      className={`relative overflow-hidden select-none shrink-0 ${roundedClass} ${className} ${
        isRotatable ? "animate-[spin_18s_linear_infinite]" : ""
      }`}
      style={{
        background: `linear-gradient(145deg, ${from} 0%, ${via} 52%, ${to} 100%)`,
        animationPlayState: isRotatable
          ? spinning
            ? "running"
            : "paused"
          : undefined,
      }}
    >
      {/* Subtle liquid glass specular highlight */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 26% 22%, rgba(255,255,255,0.42) 0%, transparent 55%)",
        }}
      />

      {/* Pattern layer */}
      {pattern === "waves" && (
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 w-full h-full opacity-55"
          preserveAspectRatio="none"
        >
          <path
            d="M0,68 C25,52 45,86 72,66 C95,50 108,74 120,62 L120,120 L0,120 Z"
            fill={accent}
            fillOpacity="0.32"
          />
          <path
            d="M0,84 C32,68 58,98 88,78 C105,66 114,82 120,76 L120,120 L0,120 Z"
            fill="#ffffff"
            fillOpacity="0.2"
          />
        </svg>
      )}

      {pattern === "orb" && (
        <>
          <div
            className="absolute w-3/5 h-3/5 rounded-full blur-md top-1/5 left-1/5 opacity-75"
            style={{ background: accent }}
          />
          <div className="absolute inset-3 rounded-full border border-white/25" />
        </>
      )}

      {pattern === "ripple" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[82%] h-[82%] rounded-full border border-white/20" />
          <div className="absolute w-[56%] h-[56%] rounded-full border border-white/30" />
          <div
            className="absolute w-[28%] h-[28%] rounded-full opacity-80 blur-[2px]"
            style={{ background: accent }}
          />
        </div>
      )}

      {pattern === "aurora" && (
        <div
          className="absolute -inset-4 opacity-60 blur-lg rotate-12"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
      )}

      {pattern === "prism" && (
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full opacity-45">
          <polygon points="60,16 106,96 14,96" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <polygon points="60,34 90,88 30,88" fill={accent} fillOpacity="0.35" />
        </svg>
      )}

      {pattern === "coral" && (
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full opacity-50">
          <circle cx="88" cy="34" r="24" fill={accent} fillOpacity="0.4" />
          <circle cx="34" cy="86" r="30" fill="#ffffff" fillOpacity="0.16" />
        </svg>
      )}

      {/* Gloss sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/20 pointer-events-none" />

      {showCenterHole && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-[var(--bg-canvas)]/70 border border-white/30 backdrop-blur-md" />
        </div>
      )}
    </div>
  );
}
