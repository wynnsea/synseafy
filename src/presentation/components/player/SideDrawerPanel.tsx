"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/src/application/stores/use-ui-store";
import { NowPlayingPanel } from "@/src/presentation/components/player/NowPlayingPanel";

/**
 * Lyrics / Up Next drawer for tablet and small desktop (md → lg).
 * On xl+ the same panel lives permanently in the right column (DesktopRightRail),
 * so this drawer is hidden there.
 */
export function SideDrawerPanel() {
  const { activeDrawer, setActiveDrawer } = useUiStore();

  return (
    <AnimatePresence>
      {activeDrawer && (
        <>
          {/* Medium-screen backdrop scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDrawer(null)}
            className="hidden md:block lg:hidden fixed inset-0 z-30 bg-[var(--bg-canvas)]/65 backdrop-blur-md"
          />

          <motion.aside
            initial={{ opacity: 0, x: 32, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 348 }}
            exit={{ opacity: 0, x: 32, width: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="hidden md:flex xl:hidden fixed lg:static top-4 right-4 bottom-[106px] lg:top-auto lg:right-auto lg:bottom-auto lg:h-screen lg:p-4 lg:pl-1 z-40 lg:z-20 shrink-0 overflow-hidden"
          >
            <div className="w-full h-full liquid-glass-dock lg:liquid-glass-strong rounded-[30px] p-4 overflow-hidden flex flex-col gap-4">
              <div className="flex-1 min-h-0">
                <NowPlayingPanel
                  tab={activeDrawer}
                  onTabChange={setActiveDrawer}
                  onClose={() => setActiveDrawer(null)}
                />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
