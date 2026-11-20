export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverGradient: {
    from: string;
    via: string;
    to: string;
  };
  trackIds: string[];
  createdAt: string;
}
