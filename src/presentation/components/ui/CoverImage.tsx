"use client";

import React from "react";

/**
 * A custom cover laid over its parent (which keeps its gradient as the fallback
 * while loading or when there is no image). Parent needs `relative overflow-hidden`.
 */
export function CoverImage({ url, alt = "" }: { url?: string | null; alt?: string }) {
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- user upload, sized by CSS
    <img
      src={url}
      alt={alt}
      loading="lazy"
      draggable={false}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
