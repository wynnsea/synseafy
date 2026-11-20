import { Track } from "@/src/domain/entities/track";
import { IMusicRepository } from "@/src/domain/repositories/music-repository";
import { GENRES, MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";

/** Offline sample catalog (NEXT_PUBLIC_USE_MOCK_DATA=true). */
export class MockMusicRepository implements IMusicRepository {
  async searchTracks(query: string, genre?: string): Promise<Track[]> {
    const q = query.trim().toLowerCase();
    return MOCK_TRACKS.filter((track) => {
      const matchesGenre = !genre || genre === "All" || track.genre === genre;
      const matchesQuery =
        !q ||
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q) ||
        track.genre.toLowerCase().includes(q);
      return matchesGenre && matchesQuery;
    });
  }

  getGenres(): string[] {
    return GENRES;
  }
}
