import { Track } from "@/src/domain/entities/track";
import { PlayRecord } from "@/src/application/stores/use-activity-store";

export interface RankedTrack {
  track: Track;
  plays: number;
  totalSeconds: number;
}

export interface RankedArtist {
  artist: string;
  plays: number;
  sampleTrack: Track;
}

export interface HourBucket {
  label: string;
  range: string;
  plays: number;
}

export interface ListeningRecap {
  totalPlays: number;
  totalMinutes: number;
  totalHoursLabel: string;
  topTracks: RankedTrack[];
  topArtists: RankedArtist[];
  topGenre: string;
  peakPeriodLabel: string;
  peakHourRange: string;
  personaTitle: string;
  hourBuckets: HourBucket[];
}

const HOUR_SLOTS = [
  { label: "00–04", range: "Late Night", min: 0, max: 3 },
  { label: "04–08", range: "Dawn", min: 4, max: 7 },
  { label: "08–12", range: "Morning", min: 8, max: 11 },
  { label: "12–16", range: "Afternoon", min: 12, max: 15 },
  { label: "16–20", range: "Evening", min: 16, max: 19 },
  { label: "20–24", range: "Night", min: 20, max: 23 },
] as const;

export function computeListeningRecap(
  records: PlayRecord[],
  catalog: Track[]
): ListeningRecap {
  const trackMap = new Map(catalog.map((t) => [t.id, t]));
  const trackCounts = new Map<string, { plays: number; totalSeconds: number }>();
  const artistCounts = new Map<string, { plays: number; sampleTrack: Track }>();
  const genreCounts = new Map<string, number>();
  const bucketCounts = HOUR_SLOTS.map(() => 0);

  let totalSeconds = 0;

  records.forEach((rec) => {
    const track = trackMap.get(rec.trackId);
    if (!track) return;

    totalSeconds += rec.durationListened;

    const prevT = trackCounts.get(track.id) ?? { plays: 0, totalSeconds: 0 };
    trackCounts.set(track.id, {
      plays: prevT.plays + 1,
      totalSeconds: prevT.totalSeconds + rec.durationListened,
    });

    const prevA = artistCounts.get(track.artist);
    artistCounts.set(track.artist, {
      plays: (prevA?.plays ?? 0) + 1,
      sampleTrack: prevA?.sampleTrack ?? track,
    });

    genreCounts.set(track.genre, (genreCounts.get(track.genre) ?? 0) + 1);

    const hour = new Date(rec.playedAt).getHours();
    const slotIdx = HOUR_SLOTS.findIndex((s) => hour >= s.min && hour <= s.max);
    if (slotIdx >= 0) bucketCounts[slotIdx] += 1;
  });

  const topTracks: RankedTrack[] = Array.from(trackCounts.entries())
    .map(([id, stats]) => ({
      track: trackMap.get(id)!,
      plays: stats.plays,
      totalSeconds: stats.totalSeconds,
    }))
    .sort((a, b) => b.plays - a.plays);

  const topArtists: RankedArtist[] = Array.from(artistCounts.entries())
    .map(([artist, stats]) => ({
      artist,
      plays: stats.plays,
      sampleTrack: stats.sampleTrack,
    }))
    .sort((a, b) => b.plays - a.plays);

  const topGenre =
    Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Ocean Chill";

  const hourBuckets: HourBucket[] = HOUR_SLOTS.map((slot, idx) => ({
    label: slot.label,
    range: slot.range,
    plays: bucketCounts[idx],
  }));

  const peakBucket =
    [...hourBuckets].sort((a, b) => b.plays - a.plays)[0] ?? hourBuckets[5];

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalHoursLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const personaMap: Record<string, string> = {
    "Late Night": "Midnight Abyss Drifter",
    Dawn: "Sunrise Sea Glass Listener",
    Morning: "Morning Tide Explorer",
    Afternoon: "Sunlit Horizon Cruiser",
    Evening: "Blue Hour Sound Voyager",
    Night: "Nocturnal Ocean Dreamer",
  };

  return {
    totalPlays: records.length,
    totalMinutes,
    totalHoursLabel,
    topTracks,
    topArtists,
    topGenre,
    peakPeriodLabel: peakBucket.range,
    peakHourRange: peakBucket.label,
    personaTitle: personaMap[peakBucket.range] ?? "Deep Ocean Voyager",
    hourBuckets,
  };
}

export function formatRecordTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) return `Today · ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Yesterday · ${timeStr}`;

  const dayStr = date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
  return `${dayStr} · ${timeStr}`;
}
