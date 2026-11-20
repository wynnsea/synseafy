import { Track } from "@/src/domain/entities/track";
import { IMusicRepository } from "@/src/domain/repositories/music-repository";
import { searchSongs } from "@/src/infrastructure/api/music-api";

/** Mood chips; on YouTube Music they act as search keywords. */
const MOODS = ["All", "Chill", "Pop", "Lo-Fi", "R&B", "Indie", "Acoustic", "Galau", "Dangdut"];

/** Live YouTube Music catalog through the FastAPI backend. */
export class ApiMusicRepository implements IMusicRepository {
  async searchTracks(query: string, genre?: string, signal?: AbortSignal): Promise<Track[]> {
    const mood = genre && genre !== "All" ? genre : "";
    const q = [query.trim(), mood].filter(Boolean).join(" ");
    // Nothing to search for: callers show their own feed (e.g. the home feed)
    if (!q) return [];
    return searchSongs(q, signal);
  }

  getGenres(): string[] {
    return MOODS;
  }
}
