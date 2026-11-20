"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useToastStore } from "@/src/application/stores/use-toast-store";

export function LiquidToast() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-[164px] md:bottom-[104px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="liquid-glass-dock rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
            <span className="truncate">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
