"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/src/application/stores/use-player-store";
import { useToastStore } from "@/src/application/stores/use-toast-store";
import {
  loadYouTubeIframeApi,
  YT_STATE,
  YTPlayer,
} from "@/src/infrastructure/youtube/iframe-api";

const MAX_CONSECUTIVE_ERRORS = 3;

/**
 * The single YouTube IFrame player behind all playback. It mirrors the player
 * store (song, play/pause, seek, volume) into YouTube and reports position,
 * end and errors back.
 *
 * NOTE: the player is kept out of sight (1×1 px) at the owner's request.
 * YouTube's API terms require embedded players to be visible (≥ 200×200 px),
 * so this carries a risk of the embed being blocked.
 */
export function YouTubeEngine() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const errorCount = useRef(0);

  // 1) Create the player once the IFrame API is loaded
  useEffect(() => {
    let cancelled = false;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        // YouTube replaces the element it's given with an iframe, so hand it a
        // node React doesn't manage
        const target = document.createElement("div");
        mountRef.current.appendChild(target);
        playerRef.current = new YT.Player(target, {
          width: "100%",
          height: "100%",
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            rel: 0,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => !cancelled && setReady(true),
            onStateChange: (e) => {
              const store = usePlayerStore.getState();
              if (e.data === YT_STATE.ENDED) store.handleEnded();
              else if (e.data === YT_STATE.PLAYING) {
                errorCount.current = 0;
                if (!store.isPlaying) store.setPlaying(true);
              } else if (e.data === YT_STATE.PAUSED && store.isPlaying) {
                store.setPlaying(false);
              }
            },
            onError: (e) => {
              const store = usePlayerStore.getState();
              errorCount.current += 1;
              const blocked = e.data === 101 || e.data === 150;
              useToastStore
                .getState()
                .showToast(
                  blocked
                    ? `"${store.currentTrack.title}" can't be played outside YouTube.`
                    : `Couldn't play "${store.currentTrack.title}".`,
                );
              if (errorCount.current >= MAX_CONSECUTIVE_ERRORS) {
                store.setPlaying(false);
                errorCount.current = 0;
                return;
              }
              store.nextTrack();
            },
          },
        });
      })
      .catch(() => {
        useToastStore.getState().showToast("Couldn't load the YouTube player.");
      });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  // 2) Store → YouTube
  useEffect(() => {
    if (!ready) return;
    const player = playerRef.current;
    if (!player) return;

    const apply = (state: ReturnType<typeof usePlayerStore.getState>) => {
      player.setVolume(Math.round(state.volume * 100));
      if (state.isMuted) player.mute();
      else player.unMute();
    };

    // Catch up with anything that happened before the player was ready
    const initial = usePlayerStore.getState();
    apply(initial);
    if (initial.hasActiveTrack && initial.currentTrack.videoId) {
      if (initial.isPlaying)
        player.loadVideoById(initial.currentTrack.videoId, initial.currentTime);
      else
        player.cueVideoById(initial.currentTrack.videoId, initial.currentTime);
    }

    return usePlayerStore.subscribe((state, prev) => {
      if (!state.hasActiveTrack) return;

      if (
        state.currentTrack.videoId !== prev.currentTrack.videoId ||
        !prev.hasActiveTrack
      ) {
        // Called synchronously from the user's click, so browsers allow autoplay
        if (state.isPlaying)
          player.loadVideoById(state.currentTrack.videoId, 0);
        else player.cueVideoById(state.currentTrack.videoId, 0);
        return;
      }
      if (state.seekNonce !== prev.seekNonce)
        player.seekTo(state.currentTime, true);
      if (state.isPlaying !== prev.isPlaying) {
        if (state.isPlaying) player.playVideo();
        else player.pauseVideo();
      }
      if (state.volume !== prev.volume || state.isMuted !== prev.isMuted)
        apply(state);
    });
  }, [ready]);

  // 3) YouTube → store, once a second
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      const player = playerRef.current;
      const store = usePlayerStore.getState();
      if (!player || !store.hasActiveTrack) return;
      const playing = player.getPlayerState() === YT_STATE.PLAYING;
      store.syncFromEngine(player.getCurrentTime() || 0, playing);
      store.setDurationIfUnknown(player.getDuration());
    }, 1000);
    return () => clearInterval(id);
  }, [ready]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="fixed left-0 bottom-0 w-px h-px opacity-0 pointer-events-none overflow-hidden [&>iframe]:w-px [&>iframe]:h-px"
    />
  );
}
