import { Track } from "@/src/domain/entities/track";

export interface IMusicRepository {
  /**
   * Songs matching `query`, narrowed by a mood/genre chip ("All" = no filter).
   * With an empty query and "All", returns a general feed instead.
   */
  searchTracks(query: string, genre?: string, signal?: AbortSignal): Promise<Track[]>;
  /** Mood / genre chips shown in the UI, starting with "All". */
  getGenres(): string[];
}
