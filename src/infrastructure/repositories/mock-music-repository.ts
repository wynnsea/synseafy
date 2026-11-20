import { Track } from "@/src/domain/entities/track";
import { IMusicRepository } from "@/src/domain/repositories/music-repository";
import { GENRES, MOCK_TRACKS } from "@/src/infrastructure/data/mock-tracks";

export class MockMusicRepository implements IMusicRepository {
  async getAllTracks(): Promise<Track[]> {
    return MOCK_TRACKS;
  }

  async getTrackById(id: string): Promise<Track | undefined> {
    return MOCK_TRACKS.find((t) => t.id === id);
  }

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

  async getPopularTracks(): Promise<Track[]> {
    return MOCK_TRACKS.filter((t) => t.isPopular);
  }

  async getTrendingTracks(): Promise<Track[]> {
    return MOCK_TRACKS.filter((t) => t.isTrending);
  }

  getGenres(): string[] {
    return GENRES;
  }
}

export const musicRepository = new MockMusicRepository();
