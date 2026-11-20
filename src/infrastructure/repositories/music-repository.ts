import { IMusicRepository } from "@/src/domain/repositories/music-repository";
import { appConfig } from "@/src/infrastructure/config/app-config";
import { ApiMusicRepository } from "@/src/infrastructure/repositories/api-music-repository";
import { MockMusicRepository } from "@/src/infrastructure/repositories/mock-music-repository";

/** The catalog the app uses: live YouTube Music, or the offline sample set. */
export const musicRepository: IMusicRepository = appConfig.useMockData
  ? new MockMusicRepository()
  : new ApiMusicRepository();
