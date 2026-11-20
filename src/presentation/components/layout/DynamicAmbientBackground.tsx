"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useThemeStore } from "@/src/application/stores/use-theme-store";

/**
 * Silky 3D Ocean Liquid Wave Wallpaper
 * Inspired by macOS / iOS Liquid Glass ocean-teal backdrops:
 * high-contrast luminous cyan/teal silk ribbons & glowing caustics so every
 * frosted Liquid Glass card & capsule visibly refracts and diffuses light.
 */
export function DynamicAmbientBackground() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const theme = useThemeStore((s) => s.theme);

  const isLight = theme === "light";

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-700"
      style={{
        background: isLight
          ? "linear-gradient(135deg, #8ed3f8 0%, #c4e8fc 38%, #7ccbf5 72%, #b5e4fb 100%)"
          : "linear-gradient(135deg, #031521 0%, #062535 38%, #041926 70%, #020e18 100%)",
      }}
    >
      {/* Sculpted Silky 3D Ocean Glass Wave Ribbons (SVG) */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="silk-wave-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={isLight ? "#38bdf8" : "#0ea5e9"}
              stopOpacity={isLight ? "0.45" : "0.55"}
            />
            <stop
              offset="45%"
              stopColor={isLight ? "#67e8f9" : "#22d3ee"}
              stopOpacity={isLight ? "0.35" : "0.38"}
            />
            <stop
              offset="100%"
              stopColor={isLight ? "#0284c7" : "#083344"}
              stopOpacity="0.12"
            />
          </linearGradient>

          <linearGradient id="silk-wave-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isLight ? "#ffffff" : "#a5f3fc"}
              stopOpacity={isLight ? "0.75" : "0.45"}
            />
            <stop
              offset="40%"
              stopColor={isLight ? "#38bdf8" : "#0891b2"}
              stopOpacity={isLight ? "0.42" : "0.5"}
            />
            <stop
              offset="100%"
              stopColor={isLight ? "#0369a1" : "#041824"}
              stopOpacity="0.18"
            />
          </linearGradient>

          <linearGradient id="silk-highlight" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop
              offset="35%"
              stopColor={isLight ? "#ffffff" : "#cffafe"}
              stopOpacity={isLight ? "0.85" : "0.65"}
            />
            <stop
              offset="65%"
              stopColor={isLight ? "#7dd3fc" : "#38bdf8"}
              stopOpacity={isLight ? "0.6" : "0.45"}
            />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id="soft-silk-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="crisp-silk-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Broad flowing ocean silk fold 1 */}
        <path
          d="M-120,620 C180,410 460,240 820,280 C1140,315 1320,160 1560,60 L1560,960 L-120,960 Z"
          fill="url(#silk-wave-1)"
          filter="url(#soft-silk-blur)"
        />

        {/* Deep sweeping liquid ribbon 2 */}
        <path
          d="M-100,260 C260,340 520,580 940,460 C1220,380 1380,520 1560,440 L1560,960 L-100,960 Z"
          fill="url(#silk-wave-2)"
          filter="url(#soft-silk-blur)"
        />

        {/* Crisp luminous glass ridge streak 1 (creates real refraction behind cards!) */}
        <path
          d="M-80,560 C240,380 540,210 920,240 C1180,260 1360,150 1540,80"
          fill="none"
          stroke="url(#silk-highlight)"
          strokeWidth="16"
          filter="url(#crisp-silk-blur)"
          opacity={isLight ? 0.9 : 0.78}
        />

        {/* Crisp luminous glass ridge streak 2 */}
        <path
          d="M-60,760 C290,590 640,680 1020,500 C1240,395 1400,450 1540,390"
          fill="none"
          stroke="url(#silk-highlight)"
          strokeWidth="12"
          filter="url(#crisp-silk-blur)"
          opacity={isLight ? 0.8 : 0.62}
        />
      </svg>

      {/* Dynamic track-reactive luminous cyan orb (top-left) */}
      <motion.div
        animate={{
          scale: isPlaying ? [1, 1.12, 1] : 1,
          x: isPlaying ? [0, 32, -14, 0] : 0,
          y: isPlaying ? [0, -18, 12, 0] : 0,
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 -left-20 w-[480px] h-[480px] md:w-[680px] md:h-[680px] rounded-full blur-[110px] transition-colors duration-1000"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, transparent 70%)"
            : `radial-gradient(circle, ${currentTrack.ambient.primary} 0%, transparent 72%)`,
        }}
      />

      {/* Dynamic bottom-right aqua caustic bloom */}
      <motion.div
        animate={{
          scale: isPlaying ? [1.05, 0.95, 1.05] : 1,
          x: isPlaying ? [0, -24, 18, 0] : 0,
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 right-[-6%] w-[460px] h-[460px] md:w-[680px] md:h-[680px] rounded-full blur-[120px] transition-colors duration-1000"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(34, 211, 238, 0.42) 0%, transparent 72%)"
            : `radial-gradient(circle, ${currentTrack.ambient.secondary} 0%, transparent 72%)`,
        }}
      />
    </div>
  );
}
