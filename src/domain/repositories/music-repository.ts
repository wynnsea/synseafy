import { Track } from "@/src/domain/entities/track";

export interface IMusicRepository {
  getAllTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | undefined>;
  searchTracks(query: string, genre?: string): Promise<Track[]>;
  getPopularTracks(): Promise<Track[]>;
  getTrendingTracks(): Promise<Track[]>;
  getGenres(): string[];
}
