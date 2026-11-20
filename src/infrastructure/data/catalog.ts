import { Track } from "@/src/domain/entities/track";
import { appConfig } from "@/src/infrastructure/config/app-config";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";

/**
 * Client-side registry of every song the app has seen (home feed, search
 * results, the user's library loaded from the database). Lets the stores keep
 * plain ids and still resolve the full Track later.
 *
 * In offline mock mode the registry starts with the bundled sample songs.
 */
const byId = new Map<string, Track>();
const byVideoId = new Map<string, Track>();

export function registerTracks(tracks: Track[]): void {
  for (const t of tracks) {
    // Keep the first full copy; later copies of the same song add nothing
    if (!byId.has(t.id)) byId.set(t.id, t);
    if (!byVideoId.has(t.videoId)) byVideoId.set(t.videoId, t);
  }
}

if (appConfig.useMockData) registerTracks(MOCK_TRACKS);

export function getCatalogTrack(trackId: string): Track | undefined {
  return byId.get(trackId);
}

export function findTrackByVideoId(videoId: string): Track | undefined {
  return byVideoId.get(videoId);
}

/** Resolve a list of ids, silently skipping any the registry doesn't know. */
export function resolveTracks(trackIds: string[]): Track[] {
  return trackIds
    .map((id) => byId.get(id))
    .filter((t): t is Track => Boolean(t));
}
