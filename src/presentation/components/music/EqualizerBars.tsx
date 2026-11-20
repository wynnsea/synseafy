"use client";

import React from "react";
import { motion } from "framer-motion";

interface EqualizerBarsProps {
  active: boolean;
}

export function EqualizerBars({ active }: EqualizerBarsProps) {
  return (
    <span
      className="inline-flex items-end gap-[2px] h-3.5 w-3.5 shrink-0"
      aria-hidden
    >
      {[0, 1, 2].map((bar) => (
        <motion.span
          key={bar}
          animate={
            active
              ? {
                  height:
                    bar === 0
                      ? ["35%", "100%", "45%"]
                      : bar === 1
                        ? ["95%", "30%", "85%"]
                        : ["50%", "90%", "35%"],
                }
              : { height: "35%" }
          }
          transition={
            active
              ? {
                  duration: 0.75 + bar * 0.14,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
          className="w-[3px] rounded-full bg-[var(--accent-cyan)]"
        />
      ))}
    </span>
  );
}
