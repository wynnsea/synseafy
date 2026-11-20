"""
Thin, cached wrapper around ytmusicapi (unauthenticated, read-only).

ytmusicapi talks to YouTube Music's internal web API, so responses are cached
to keep request volume low and the app fast. Everything here is synchronous;
FastAPI runs these calls in its threadpool.
"""

from __future__ import annotations

import os
import re
import threading
from typing import Any, Callable, TypeVar

from cachetools import TTLCache
from ytmusicapi import YTMusic

from app.schemas import AlbumRef, Artist, ArtistRef, LyricLine, LyricsResponse, Track

T = TypeVar("T")

LANGUAGE = os.getenv("YTM_LANGUAGE", "en")
LOCATION = os.getenv("YTM_LOCATION", "ID")  # charts / home are country-specific

# One client per worker thread (the underlying requests.Session isn't shared)
_local = threading.local()


def _client() -> YTMusic:
    client = getattr(_local, "client", None)
    if client is None:
        client = YTMusic(language=LANGUAGE, location=LOCATION)
        _local.client = client
    return client


# --- caching ----------------------------------------------------------------

_caches: dict[str, TTLCache] = {
    "search": TTLCache(maxsize=512, ttl=10 * 60),
    "home": TTLCache(maxsize=4, ttl=30 * 60),
    "track": TTLCache(maxsize=2048, ttl=24 * 60 * 60),
    "lyrics": TTLCache(maxsize=2048, ttl=24 * 60 * 60),
}
_cache_lock = threading.Lock()


def _cached(bucket: str, key: str, load: Callable[[], T]) -> T:
    cache = _caches[bucket]
    with _cache_lock:
        if key in cache:
            return cache[key]
    value = load()  # outside the lock: network calls can be slow
    with _cache_lock:
        cache[key] = value
    return value


# --- mapping ------------------------------------------------------------------

_SIZE_RE = re.compile(r"=w\d+-h\d+")


def best_thumbnail(thumbnails: list[dict[str, Any]] | None, size: int = 544) -> str | None:
    """Largest thumbnail, upscaled for googleusercontent URLs (they accept any size)."""
    if not thumbnails:
        return None
    url = max(thumbnails, key=lambda t: t.get("width", 0) * t.get("height", 0))["url"]
    if "googleusercontent.com" in url and _SIZE_RE.search(url):
        url = _SIZE_RE.sub(f"=w{size}-h{size}", url)
    return url


def _duration_seconds(item: dict[str, Any]) -> int | None:
    if isinstance(item.get("duration_seconds"), int):
        return item["duration_seconds"]
    text = item.get("duration") or item.get("length")
    if not text:
        return None
    try:
        total = 0
        for part in str(text).split(":"):
            total = total * 60 + int(part)
        return total
    except ValueError:
        return None


def to_track(item: dict[str, Any]) -> Track | None:
    """Normalise a song/video item from any ytmusicapi endpoint. None if unplayable."""
    video_id = item.get("videoId")
    if not video_id or item.get("isAvailable") is False:
        return None
    album = item.get("album")
    return Track(
        video_id=video_id,
        title=item.get("title") or "Unknown title",
        artists=[
            ArtistRef(name=a["name"], id=a.get("id"))
            for a in (item.get("artists") or [])
            if a.get("name")
        ],
        album=AlbumRef(name=album["name"], id=album.get("id")) if album and album.get("name") else None,
        duration_seconds=_duration_seconds(item),
        thumbnail_url=best_thumbnail(item.get("thumbnails") or item.get("thumbnail")),
        is_explicit=bool(item.get("isExplicit")),
    )


def _tracks(items: list[dict[str, Any]], limit: int | None = None) -> list[Track]:
    out: list[Track] = []
    seen: set[str] = set()
    for item in items:
        track = to_track(item)
        if track and track.video_id not in seen:
            seen.add(track.video_id)
            out.append(track)
            if limit and len(out) >= limit:
                break
    return out


# --- public API -------------------------------------------------------------


def search_songs(query: str, limit: int) -> list[Track]:
    key = f"{query.strip().lower()}|{limit}"
    return _cached(
        "search",
        key,
        lambda: _tracks(_client().search(query, filter="songs", limit=limit), limit),
    )


def home() -> tuple[list[Track], list[Track], list[Artist]]:
    def load() -> tuple[list[Track], list[Track], list[Artist]]:
        yt = _client()
        charts = yt.get_charts(country=LOCATION)

        # Charts expose "Trending" as a playlist; prefer it, fall back to the first one
        playlists = charts.get("videos") or []
        chosen = next((p for p in playlists if "trending" in p.get("title", "").lower()), None)
        chosen = chosen or (playlists[0] if playlists else None)
        trending = (
            _tracks(yt.get_playlist(chosen["playlistId"], limit=30).get("tracks", []), 20)
            if chosen
            else []
        )

        artists = [
            Artist(
                id=a["browseId"],
                name=a["title"],
                thumbnail_url=best_thumbnail(a.get("thumbnails"), 320),
                subscribers=a.get("subscribers"),
            )
            for a in (charts.get("artists") or [])[:12]
            if a.get("browseId") and a.get("title")
        ]

        quick_picks: list[Track] = []
        for shelf in yt.get_home(limit=4):
            items = [c for c in shelf.get("contents", []) if c.get("videoId")]
            if items:
                quick_picks = _tracks(items, 20)
                break

        return trending, quick_picks, artists

    return _cached("home", LOCATION, load)


def track_with_up_next(video_id: str) -> tuple[Track, list[Track]] | None:
    def load() -> tuple[Track, list[Track]] | None:
        watch = _client().get_watch_playlist(videoId=video_id, limit=25)
        tracks = _tracks(watch.get("tracks", []))
        current = next((t for t in tracks if t.video_id == video_id), None)
        if current is None:
            return None
        # YouTube returns a long radio regardless of `limit`; keep it short
        return current, [t for t in tracks if t.video_id != video_id][:25]

    return _cached("track", video_id, load)


_NOISE_RE = re.compile(
    r"\s*[\(\[][^)\]]*(official|video|mv|lyric|audio|live|cover|feat|ft\.)[^)\]]*[\)\]]",
    re.IGNORECASE,
)


def _title_variants(title: str) -> list[str]:
    """
    Plausible song titles inside a video title, e.g.
    'MIMPI MANIS - Jeyma Monica (Official MV)' -> ['mimpi manis', 'jeyma monica'],
    'Robi DA7 - Mustahil | Official Music Video' -> ['robi da7', 'mustahil'].
    """
    t = _NOISE_RE.sub("", title)
    parts = [re.sub(r"\s+", " ", p).strip().lower() for p in re.split(r"\s+[-|~]\s+", t)]
    parts = [p for p in parts[:2] if p and "official" not in p]
    return list(dict.fromkeys(parts))


def _clean_title(title: str) -> str:
    """'MIMPI MANIS - Jeyma Monica (Official Music Video)' -> 'mimpi manis'."""
    variants = _title_variants(title)
    return variants[0] if variants else ""


def _song_version_lyrics_id(yt: YTMusic, watch_track: dict[str, Any]) -> str | None:
    """
    Music videos (MVs, uploads) often have no lyrics while the official song
    version does. Find that version by title + artist and return its lyrics id.
    """
    artists = [a.get("name", "") for a in (watch_track.get("artists") or [])]
    for title in _title_variants(watch_track.get("title") or ""):
        query = f"{title} {artists[0] if artists else ''}".strip()
        for item in yt.search(query, filter="songs", limit=5)[:5]:
            candidate = _clean_title(item.get("title") or "")
            if candidate and (
                candidate == title or candidate.startswith(title) or title.startswith(candidate)
            ):
                browse_id = yt.get_watch_playlist(videoId=item["videoId"], limit=1).get("lyrics")
                if browse_id:
                    return browse_id
    return None


def lyrics(video_id: str) -> LyricsResponse:
    def load() -> LyricsResponse:
        yt = _client()
        watch = yt.get_watch_playlist(videoId=video_id, limit=1)
        browse_id = watch.get("lyrics")
        if not browse_id and watch.get("tracks"):
            browse_id = _song_version_lyrics_id(yt, watch["tracks"][0])
        if not browse_id:
            return LyricsResponse(video_id=video_id, available=False, timed=False, lines=[])

        data = yt.get_lyrics(browse_id, timestamps=True)
        raw = data.get("lyrics") if data else None
        if not raw:
            return LyricsResponse(video_id=video_id, available=False, timed=False, lines=[])

        if data.get("hasTimestamps") and isinstance(raw, list):
            lines = [
                LyricLine(time=line.start_time / 1000, text=line.text)
                for line in raw
                if line.text and line.text.strip()
            ]
            return LyricsResponse(
                video_id=video_id, available=True, timed=True, lines=lines, source=data.get("source")
            )

        text = raw if isinstance(raw, str) else "\n".join(getattr(l, "text", str(l)) for l in raw)
        lines = [LyricLine(time=0, text=t) for t in text.splitlines() if t.strip()]
        return LyricsResponse(
            video_id=video_id, available=True, timed=False, lines=lines, source=data.get("source")
        )

    return _cached("lyrics", video_id, load)
