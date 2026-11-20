import { Playlist } from "@/src/domain/entities/playlist";

export interface IPlaylistRepository {
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | undefined>;
}
