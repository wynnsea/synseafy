import { LyricLine, Track } from "@/src/domain/entities/track";
import { appConfig } from "@/src/infrastructure/config/app-config";
import { registerTracks } from "@/src/infrastructure/data/catalog";
import { buildTrack } from "@/src/infrastructure/data/track-factory";

/**
 * Client for the Synseafy FastAPI backend (YouTube Music catalog).
 * Every song returned is added to the catalog registry.
 */

interface ApiTrack {
  videoId: string;
  title: string;
  artists: { name: string; id?: string | null }[];
  album?: { name: string; id?: string | null } | null;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  isExplicit?: boolean;
}

export interface CatalogArtist {
  id: string;
  name: string;
  thumbnailUrl?: string;
  subscribers?: string;
}

export interface HomeFeed {
  trending: Track[];
  quickPicks: Track[];
  artists: CatalogArtist[];
}

export interface TrackLyrics {
  available: boolean;
  /** True when every line has a real start time */
  timed: boolean;
  lines: LyricLine[];
  source?: string;
}

export class MusicApiError extends Error {}

const BASE = appConfig.apiBaseUrl.replace(/\/+$/, "");

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new MusicApiError("Can't reach the music server.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new MusicApiError(body?.detail ?? `Music server error (${res.status}).`);
  }
  return res.json() as Promise<T>;
}

function toTracks(items: ApiTrack[]): Track[] {
  const tracks = items.map((t) =>
    buildTrack({
      videoId: t.videoId,
      title: t.title,
      artists: t.artists.map((a) => a.name),
      album: t.album?.name,
      durationSeconds: t.durationSeconds,
      thumbnailUrl: t.thumbnailUrl,
      isExplicit: t.isExplicit,
    })
  );
  registerTracks(tracks);
  return tracks;
}

export async function searchSongs(query: string, signal?: AbortSignal): Promise<Track[]> {
  const data = await get<{ tracks: ApiTrack[] }>(
    `/api/search?q=${encodeURIComponent(query)}&limit=30`,
    signal
  );
  return toTracks(data.tracks);
}

export async function fetchHome(): Promise<HomeFeed> {
  const data = await get<{
    trending: ApiTrack[];
    quickPicks: ApiTrack[];
    artists: { id: string; name: string; thumbnailUrl?: string | null; subscribers?: string | null }[];
  }>("/api/home");
  return {
    trending: toTracks(data.trending),
    quickPicks: toTracks(data.quickPicks),
    artists: data.artists.map((a) => ({
      id: a.id,
      name: a.name,
      thumbnailUrl: a.thumbnailUrl ?? undefined,
      subscribers: a.subscribers ?? undefined,
    })),
  };
}

/** Songs YouTube Music would play after this one (for autoplay). */
export async function fetchUpNext(videoId: string): Promise<Track[]> {
  const data = await get<{ track: ApiTrack; upNext: ApiTrack[] }>(
    `/api/tracks/${encodeURIComponent(videoId)}`
  );
  return toTracks(data.upNext);
}

export async function fetchLyrics(videoId: string): Promise<TrackLyrics> {
  const data = await get<TrackLyrics>(`/api/tracks/${encodeURIComponent(videoId)}/lyrics`);
  return {
    available: data.available,
    timed: data.timed,
    lines: data.lines,
    source: data.source ?? undefined,
  };
}
