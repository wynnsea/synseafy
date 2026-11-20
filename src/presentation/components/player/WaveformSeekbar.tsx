"use client";

import React from "react";

interface WaveformSeekbarProps {
  waveform: number[];
  progress: number; // 0 to 1
  onSeek: (ratio: number) => void;
  height?: number;
  compact?: boolean;
}

export function WaveformSeekbar({
  waveform,
  progress,
  onSeek,
  height = 42,
  compact = false,
}: WaveformSeekbarProps) {
  const handleBarClick = (index: number) => {
    const ratio = (index + 0.5) / waveform.length;
    onSeek(ratio);
  };

  return (
    <div
      className="flex items-center justify-between gap-[3px] w-full cursor-pointer select-none"
      style={{ height }}
      role="slider"
      aria-label="Audio waveform seekbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      {waveform.map((amp, i) => {
        const barRatio = i / waveform.length;
        const isPlayed = barRatio <= progress;
        const barHeight = Math.max(compact ? 5 : 7, Math.round(amp * height));

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleBarClick(i)}
            className="flex-1 flex items-center justify-center h-full group cursor-pointer"
            aria-label={`Seek to ${Math.round(barRatio * 100)}%`}
          >
            <span
              className={`w-full max-w-[4px] rounded-full transition-all duration-200 group-hover:scale-y-125 ${
                isPlayed
                  ? "bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.65)]"
                  : "bg-[var(--text-muted)]/35 group-hover:bg-[var(--accent-cyan)]/60"
              }`}
              style={{ height: barHeight }}
            />
          </button>
        );
      })}
    </div>
  );
}
