export interface Playlist {
  id: string;
  name: string;
  description: string;
  /** Custom cover image; when absent the gradient cover is shown */
  coverUrl?: string;
  coverGradient: {
    from: string;
    via: string;
    to: string;
  };
  trackIds: string[];
  createdAt: string;
}
