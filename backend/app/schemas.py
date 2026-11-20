"""Response models. JSON uses camelCase to match the Next.js frontend."""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ArtistRef(ApiModel):
    name: str
    id: str | None = None


class AlbumRef(ApiModel):
    name: str
    id: str | None = None


class Track(ApiModel):
    video_id: str
    title: str
    artists: list[ArtistRef]
    album: AlbumRef | None = None
    duration_seconds: int | None = None
    thumbnail_url: str | None = None
    is_explicit: bool = False


class Artist(ApiModel):
    id: str
    name: str
    thumbnail_url: str | None = None
    subscribers: str | None = None


class SearchResponse(ApiModel):
    query: str
    tracks: list[Track]


class HomeResponse(ApiModel):
    trending: list[Track]
    quick_picks: list[Track]
    artists: list[Artist]


class TrackResponse(ApiModel):
    track: Track
    #: Songs YouTube Music would play next ("radio"), useful for autoplay
    up_next: list[Track]


class LyricLine(ApiModel):
    #: Seconds from the start of the song (0 for every line when not timed)
    time: float
    text: str


class LyricsResponse(ApiModel):
    video_id: str
    #: False when the song has no lyrics on YouTube Music
    available: bool
    #: True when each line has a real start time (karaoke-style highlighting)
    timed: bool
    lines: list[LyricLine]
    source: str | None = None
