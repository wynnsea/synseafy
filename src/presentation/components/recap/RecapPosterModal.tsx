"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, Sparkles, Clock, Flame, Disc3 } from "lucide-react";
import { ListeningRecap } from "@/src/application/use-cases/compute-recap";
import { useAuthStore } from "@/src/application/stores/use-auth-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";

interface RecapPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  recap: ListeningRecap;
}

type PosterThemeId = "abyss" | "cyan" | "seaglass";
type PosterRatio = "story" | "square";

const POSTER_THEMES: Record<
  PosterThemeId,
  {
    label: string;
    bgCss: string;
    canvasBg: [string, string, string];
    orb1: string;
    orb2: string;
    textMain: string;
    textSub: string;
    accent: string;
    cardFill: string;
    cardStroke: string;
    isLight?: boolean;
  }
> = {
  abyss: {
    label: "Deep Abyss",
    bgCss: "linear-gradient(155deg, #020c18 0%, #062138 52%, #041322 100%)",
    canvasBg: ["#020c18", "#062138", "#041322"],
    orb1: "rgba(14, 165, 233, 0.45)",
    orb2: "rgba(34, 211, 238, 0.3)",
    textMain: "#f4fbff",
    textSub: "#9cc8e6",
    accent: "#38bdf8",
    cardFill: "rgba(255, 255, 255, 0.08)",
    cardStroke: "rgba(255, 255, 255, 0.18)",
  },
  cyan: {
    label: "Soft Cyan",
    bgCss: "linear-gradient(155deg, #032b45 0%, #026aa7 52%, #083344 100%)",
    canvasBg: ["#032b45", "#026aa7", "#083344"],
    orb1: "rgba(103, 232, 249, 0.5)",
    orb2: "rgba(56, 189, 248, 0.38)",
    textMain: "#ffffff",
    textSub: "#d4f2ff",
    accent: "#67e8f9",
    cardFill: "rgba(255, 255, 255, 0.13)",
    cardStroke: "rgba(255, 255, 255, 0.28)",
  },
  seaglass: {
    label: "Sea Glass",
    bgCss: "linear-gradient(155deg, #d5eefc 0%, #9fd8f8 52%, #cbe9fc 100%)",
    canvasBg: ["#d5eefc", "#9fd8f8", "#cbe9fc"],
    orb1: "rgba(255, 255, 255, 0.72)",
    orb2: "rgba(56, 189, 248, 0.35)",
    textMain: "#06213a",
    textSub: "#25537a",
    accent: "#0284c7",
    cardFill: "rgba(255, 255, 255, 0.56)",
    cardStroke: "rgba(255, 255, 255, 0.85)",
    isLight: true,
  },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function RecapPosterModal({
  isOpen,
  onClose,
  recap,
}: RecapPosterModalProps) {
  const [themeId, setThemeId] = useState<PosterThemeId>("abyss");
  const [ratio, setRatio] = useState<PosterRatio>("story");
  const [isExporting, setIsExporting] = useState(false);

  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);

  const displayName = user?.name ?? "Wynnsea";
  const theme = POSTER_THEMES[themeId];
  const top5 = recap.topTracks.slice(0, 5);
  const topArtist = recap.topArtists[0]?.artist ?? "Wynnsea Collective";

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const width = 1080;
      const height = ratio === "story" ? 1920 : 1080;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, theme.canvasBg[0]);
      bgGrad.addColorStop(0.5, theme.canvasBg[1]);
      bgGrad.addColorStop(1, theme.canvasBg[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient glowing ocean orbs
      const orbA = ctx.createRadialGradient(220, 260, 20, 220, 260, 480);
      orbA.addColorStop(0, theme.orb1);
      orbA.addColorStop(1, "transparent");
      ctx.fillStyle = orbA;
      ctx.fillRect(0, 0, width, height);

      const orbB = ctx.createRadialGradient(
        width - 180,
        height - 260,
        20,
        width - 180,
        height - 260,
        520
      );
      orbB.addColorStop(0, theme.orb2);
      orbB.addColorStop(1, "transparent");
      ctx.fillStyle = orbB;
      ctx.fillRect(0, 0, width, height);

      const pad = 76;
      const isStory = ratio === "story";

      // 3. Header
      ctx.fillStyle = theme.accent;
      ctx.font = "700 26px system-ui, -apple-system, sans-serif";
      ctx.fillText("SYNSEAFY · OCEAN RECAP", pad, isStory ? 130 : 96);

      ctx.fillStyle = theme.textMain;
      ctx.font = `800 ${isStory ? 64 : 52}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(`${displayName}'s Sound`, pad, isStory ? 210 : 162);

      ctx.fillStyle = theme.textSub;
      ctx.font = `500 ${isStory ? 30 : 24}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(recap.personaTitle, pad, isStory ? 258 : 202);

      // 4. Stats Row (3 glass cards)
      const statY = isStory ? 320 : 245;
      const statH = isStory ? 190 : 150;
      const gap = 24;
      const cardW = (width - pad * 2 - gap * 2) / 3;
      const stats = [
        { label: "TOTAL PLAYS", value: String(recap.totalPlays) },
        { label: "TIME LISTENED", value: recap.totalHoursLabel },
        { label: "PEAK HOUR", value: recap.peakHourRange },
      ];

      stats.forEach((st, i) => {
        const cx = pad + i * (cardW + gap);
        roundRect(ctx, cx, statY, cardW, statH, 32);
        ctx.fillStyle = theme.cardFill;
        ctx.fill();
        ctx.strokeStyle = theme.cardStroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = theme.textSub;
        ctx.font = "700 20px system-ui, -apple-system, sans-serif";
        ctx.fillText(st.label, cx + 28, statY + 52);

        ctx.fillStyle = theme.textMain;
        ctx.font = `800 ${isStory ? 52 : 42}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(st.value, cx + 28, statY + (isStory ? 132 : 112));
      });

      // 5. Top Tracks Glass Panel
      const listY = statY + statH + (isStory ? 54 : 34);
      const rowH = isStory ? 128 : 82;
      const listH = (isStory ? 120 : 88) + top5.length * rowH;

      roundRect(ctx, pad, listY, width - pad * 2, listH, 40);
      ctx.fillStyle = theme.cardFill;
      ctx.fill();
      ctx.strokeStyle = theme.cardStroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = theme.accent;
      ctx.font = "700 24px system-ui, -apple-system, sans-serif";
      ctx.fillText("TOP PLAYED TRACKS", pad + 42, listY + 62);

      top5.forEach((item, idx) => {
        const y = listY + (isStory ? 130 : 104) + idx * rowH;

        ctx.fillStyle = theme.accent;
        ctx.font = `800 ${isStory ? 40 : 30}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(`0${idx + 1}`, pad + 42, y + 12);

        ctx.fillStyle = theme.textMain;
        ctx.font = `700 ${isStory ? 36 : 28}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(item.track.title, pad + 130, y + 6);

        ctx.fillStyle = theme.textSub;
        ctx.font = `500 ${isStory ? 24 : 20}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(item.track.artist, pad + 130, y + (isStory ? 44 : 34));

        // Play count pill on right
        const countLabel = `${item.plays} plays`;
        ctx.font = `700 ${isStory ? 24 : 20}px system-ui, -apple-system, sans-serif`;
        const tw = ctx.measureText(countLabel).width;
        ctx.fillStyle = theme.accent;
        ctx.fillText(countLabel, width - pad - 42 - tw, y + 12);
      });

      // 6. Top Artist & Genre Footer Banner
      const footY = height - (isStory ? 240 : 132);
      ctx.fillStyle = theme.textSub;
      ctx.font = "600 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `Top Artist: ${topArtist}  ·  Top Genre: ${recap.topGenre}`,
        pad,
        footY
      );

      ctx.fillStyle = theme.accent;
      ctx.font = "700 26px system-ui, -apple-system, sans-serif";
      ctx.fillText("music.wynnsea.my.id", pad, footY + 52);

      // Trigger PNG download
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `synseafy-recap-${ratio}.png`;
      a.click();
      showToast("Recap poster PNG downloaded!");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] liquid-glass-dock rounded-[34px] p-5 space-y-4 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Ocean Listening Poster
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close poster modal"
                className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme & Ratio Switchers */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(Object.keys(POSTER_THEMES) as PosterThemeId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setThemeId(id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      themeId === id
                        ? "ocean-gradient-btn"
                        : "liquid-pill text-[var(--text-secondary)]"
                    }`}
                  >
                    {POSTER_THEMES[id].label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRatio("story")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                    ratio === "story"
                      ? "ocean-gradient-btn"
                      : "liquid-pill text-[var(--text-secondary)]"
                  }`}
                >
                  9:16
                </button>
                <button
                  onClick={() => setRatio("square")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                    ratio === "square"
                      ? "ocean-gradient-btn"
                      : "liquid-pill text-[var(--text-secondary)]"
                  }`}
                >
                  1:1
                </button>
              </div>
            </div>

            {/* Live Poster Preview */}
            <div
              className={`relative w-full rounded-[26px] p-5 overflow-hidden border shadow-2xl flex flex-col justify-between transition-all duration-300 ${
                ratio === "story" ? "min-h-[450px]" : "min-h-[340px]"
              }`}
              style={{
                background: theme.bgCss,
                borderColor: theme.cardStroke,
                color: theme.textMain,
              }}
            >
              {/* Soft ambient orbs inside preview */}
              <div
                className="absolute -top-12 -left-10 w-44 h-44 rounded-full blur-3xl pointer-events-none"
                style={{ background: theme.orb1 }}
              />
              <div
                className="absolute -bottom-12 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none"
                style={{ background: theme.orb2 }}
              />

              {/* Poster Header */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-[10px] font-bold tracking-[0.2em] uppercase"
                    style={{ color: theme.accent }}
                  >
                    Synseafy · Ocean Recap
                  </p>
                  <h4 className="text-xl font-extrabold tracking-tight mt-0.5">
                    {displayName}&apos;s Sound
                  </h4>
                  <p className="text-xs opacity-80">{recap.personaTitle}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md p-1.5 border border-white/25 shrink-0">
                  <Image
                    src="/brand/logo-v3.png"
                    alt="Synseafy"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* 3 Mini Stat Pills */}
              <div className="relative z-10 grid grid-cols-3 gap-2 my-3">
                <div
                  className="rounded-2xl p-2.5 border"
                  style={{
                    background: theme.cardFill,
                    borderColor: theme.cardStroke,
                  }}
                >
                  <Flame className="w-3.5 h-3.5 mb-1" style={{ color: theme.accent }} />
                  <p className="text-base font-extrabold leading-none">
                    {recap.totalPlays}
                  </p>
                  <p className="text-[10px] opacity-75 mt-1">Plays</p>
                </div>

                <div
                  className="rounded-2xl p-2.5 border"
                  style={{
                    background: theme.cardFill,
                    borderColor: theme.cardStroke,
                  }}
                >
                  <Clock className="w-3.5 h-3.5 mb-1" style={{ color: theme.accent }} />
                  <p className="text-base font-extrabold leading-none">
                    {recap.totalHoursLabel}
                  </p>
                  <p className="text-[10px] opacity-75 mt-1">Listened</p>
                </div>

                <div
                  className="rounded-2xl p-2.5 border"
                  style={{
                    background: theme.cardFill,
                    borderColor: theme.cardStroke,
                  }}
                >
                  <Disc3 className="w-3.5 h-3.5 mb-1" style={{ color: theme.accent }} />
                  <p className="text-base font-extrabold leading-none">
                    {recap.peakHourRange}
                  </p>
                  <p className="text-[10px] opacity-75 mt-1">
                    {recap.peakPeriodLabel}
                  </p>
                </div>
              </div>

              {/* Top 5 Tracks Card */}
              <div
                className="relative z-10 rounded-2xl p-3.5 border space-y-2"
                style={{
                  background: theme.cardFill,
                  borderColor: theme.cardStroke,
                }}
              >
                <p
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: theme.accent }}
                >
                  Top Played Tracks
                </p>
                <div className="space-y-1.5">
                  {top5.map((item, idx) => (
                    <div
                      key={item.track.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="font-mono font-bold text-[11px] w-4 shrink-0"
                          style={{ color: theme.accent }}
                        >
                          0{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate leading-tight">
                            {item.track.title}
                          </p>
                          <p className="text-[10px] opacity-75 truncate">
                            {item.track.artist}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-bold shrink-0"
                        style={{ color: theme.accent }}
                      >
                        {item.plays}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 flex items-center justify-between pt-3 text-[10px]">
                <span className="opacity-80 truncate">
                  Top Artist: <strong>{topArtist}</strong> · {recap.topGenre}
                </span>
                <span
                  className="font-bold shrink-0 ml-2"
                  style={{ color: theme.accent }}
                >
                  music.wynnsea.my.id
                </span>
              </div>
            </div>

            {/* Download Action */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="w-full py-3 rounded-full ocean-gradient-btn text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting
                  ? "Rendering HD Poster..."
                  : `Download HD Poster (${ratio === "story" ? "1080×1920" : "1080×1080"})`}
              </span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
