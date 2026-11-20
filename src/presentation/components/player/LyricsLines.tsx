"use client";

import React, { useEffect, useRef, useState } from "react";
import type { useTrackLyrics } from "@/src/application/hooks/use-track-lyrics";

type LyricsState = ReturnType<typeof useTrackLyrics>;

/** Pause auto-centering for a moment after the listener scrolls by hand. */
const MANUAL_SCROLL_GRACE_MS = 4000;

/**
 * Lyrics list that keeps the line being sung centred in its scroll area
 * (karaoke style). Tapping a timed line seeks to it.
 */
export function LyricsLines({
  lyrics,
  onSeek,
  align = "left",
  resetKey,
  className = "",
}: {
  lyrics: LyricsState;
  onSeek: (seconds: number) => void;
  align?: "left" | "center";
  /** Changes (e.g. the song id) jump back to the top without animation */
  resetKey: string;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const manualAt = useRef(0);
  // Space below the lines so the last ones can still reach the centre
  // (measured, since container sizes vary)
  const [edgePad, setEdgePad] = useState(0);

  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() =>
      setEdgePad(Math.round(box.clientHeight * 0.42)),
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // New song: start from the top
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    manualAt.current = 0;
  }, [resetKey]);

  // Keep the active line in the middle of the visible area
  useEffect(() => {
    const box = scrollRef.current;
    const line = lineRefs.current[lyrics.activeIndex];
    if (!box || !line || !lyrics.timed) return;
    if (Date.now() - manualAt.current < MANUAL_SCROLL_GRACE_MS) return;
    const target =
      line.offsetTop - box.clientHeight / 2 + line.offsetHeight / 2;
    box.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [lyrics.activeIndex, lyrics.timed]);

  const markManual = () => {
    manualAt.current = Date.now();
  };

  const centered = align === "center";

  return (
    <div
      ref={scrollRef}
      onWheel={markManual}
      onTouchStart={markManual}
      onPointerDown={markManual}
      className={`relative overflow-y-auto no-scrollbar ${className}`}
    >
      {lyrics.status !== "ready" ? (
        <p
          className={`text-sm text-[var(--text-muted)] py-6 ${centered ? "text-center" : ""}`}
        >
          {lyrics.status === "loading"
            ? "Loading lyrics…"
            : lyrics.status === "error"
              ? "Couldn't load lyrics. Try again later."
              : "Lyrics aren't available for this song."}
        </p>
      ) : (
        <>
          {/* Lyrics start at the top; the active line moves down until it
              reaches the centre, then stays there while the text scrolls.
              (Only a bottom spacer, so the last lines can reach the centre too.) */}
          <div className="space-y-4 px-1 py-2">
            {lyrics.lines.map((line, idx) => {
              const active = idx === lyrics.activeIndex;
              return (
                <button
                  key={idx}
                  ref={(el) => {
                    lineRefs.current[idx] = el;
                  }}
                  onClick={() => lyrics.timed && onSeek(line.time)}
                  disabled={!lyrics.timed}
                  className={`block w-full transition-all duration-300 ${
                    centered ? "text-center" : "text-left"
                  } ${lyrics.timed ? "cursor-pointer" : "cursor-default"} ${
                    active
                      ? "text-lg sm:text-xl font-bold text-[var(--accent-cyan)] drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]"
                      : lyrics.timed && idx < lyrics.activeIndex
                        ? "text-sm sm:text-base text-[var(--text-secondary)]/45 hover:text-[var(--text-primary)]"
                        : "text-sm sm:text-base text-[var(--text-secondary)]/80 hover:text-[var(--text-primary)]"
                  }`}
                >
                  {line.text}
                </button>
              );
            })}
          </div>
          {lyrics.timed && <div aria-hidden style={{ height: edgePad }} />}
        </>
      )}
    </div>
  );
}
