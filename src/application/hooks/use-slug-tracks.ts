"use client";

import { useMemo } from "react";
import { Track } from "@/src/domain/entities/track";
import { toSlug } from "@/src/application/use-cases/slugify";
import { useSongSearch } from "@/src/application/hooks/use-song-search";

/**
 * Songs for an artist or album page addressed by slug (/artist/tulus).
 * Searches by the slug's words, then keeps only exact artist/album matches.
 */
export function useSlugTracks(
  kind: "artist" | "album",
  slug: string
): { tracks: Track[]; loading: boolean } {
  const search = useSongSearch(slug.replace(/-/g, " "));

  const tracks = useMemo(
    () =>
      search.tracks.filter((t) =>
        kind === "album"
          ? toSlug(t.album) === slug
          : (t.artists?.length ? t.artists : [t.artist]).some((a) => toSlug(a) === slug)
      ),
    [search.tracks, kind, slug]
  );

  return { tracks, loading: search.loading };
}
