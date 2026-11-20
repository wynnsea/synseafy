import { Track } from "@/src/domain/entities/track";
import { MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";

/**
 * Song catalog lookups. The database stores songs by YouTube `videoId`, while the
 * UI works with `Track.id`. Until the FastAPI / YouTube Music catalog is wired up,
 * the catalog is the mock track list; swap the source here later.
 */
const byId = new Map(MOCK_TRACKS.map((t) => [t.id, t]));
const byVideoId = new Map(MOCK_TRACKS.map((t) => [t.videoId, t]));

export function getCatalogTrack(trackId: string): Track | undefined {
  return byId.get(trackId);
}

export function findTrackByVideoId(videoId: string): Track | undefined {
  return byVideoId.get(videoId);
}

export function getAllCatalogTracks(): Track[] {
  return MOCK_TRACKS;
}
