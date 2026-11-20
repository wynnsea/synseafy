"""Synseafy API: read-only YouTube Music catalog (search, home, track, lyrics)."""

from __future__ import annotations

import logging
import os
import re

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app import ytm
from app.schemas import HomeResponse, LyricsResponse, SearchResponse, TrackResponse

log = logging.getLogger("synseafy")

app = FastAPI(title="Synseafy API", version="0.1.0")

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,https://music.wynnsea.my.id"
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
    max_age=3600,
)

# YouTube video ids are 11 chars of [A-Za-z0-9_-]
VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


def _check_video_id(video_id: str) -> None:
    if not VIDEO_ID_RE.match(video_id):
        raise HTTPException(status_code=400, detail="Invalid video id.")


def _upstream_error(context: str, err: Exception) -> HTTPException:
    log.exception("%s failed: %s", context, err)
    return HTTPException(status_code=502, detail="YouTube Music is unavailable right now.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/search", response_model=SearchResponse, response_model_by_alias=True)
def search(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=50),
) -> SearchResponse:
    try:
        tracks = ytm.search_songs(q, limit)
    except Exception as err:  # noqa: BLE001 - surface any upstream failure as 502
        raise _upstream_error("search", err) from err
    return SearchResponse(query=q, tracks=tracks)


@app.get("/api/home", response_model=HomeResponse, response_model_by_alias=True)
def home() -> HomeResponse:
    try:
        trending, quick_picks, artists = ytm.home()
    except Exception as err:  # noqa: BLE001
        raise _upstream_error("home", err) from err
    return HomeResponse(trending=trending, quick_picks=quick_picks, artists=artists)


@app.get("/api/tracks/{video_id}", response_model=TrackResponse, response_model_by_alias=True)
def track(video_id: str) -> TrackResponse:
    _check_video_id(video_id)
    try:
        result = ytm.track_with_up_next(video_id)
    except Exception as err:  # noqa: BLE001
        raise _upstream_error("track", err) from err
    if result is None:
        raise HTTPException(status_code=404, detail="Song not found.")
    current, up_next = result
    return TrackResponse(track=current, up_next=up_next)


@app.get(
    "/api/tracks/{video_id}/lyrics",
    response_model=LyricsResponse,
    response_model_by_alias=True,
)
def lyrics(video_id: str) -> LyricsResponse:
    _check_video_id(video_id)
    try:
        return ytm.lyrics(video_id)
    except Exception as err:  # noqa: BLE001
        raise _upstream_error("lyrics", err) from err
