# Synseafy API

Read-only YouTube Music catalog for the Synseafy web app, built with FastAPI and
[ytmusicapi](https://github.com/sigma67/ytmusicapi). It provides metadata only
(search, home feed, song info, lyrics). Playback happens in the browser through
the official YouTube IFrame Player.

## Run locally

```bash
cd backend
python3 -m venv .venv            # if this fails with "ensurepip is not available":
                                  #   python3 -m venv --without-pip .venv
                                  #   pip3 --python .venv/bin/python install -r requirements.txt
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

The frontend reads `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`).
Interactive docs: http://localhost:8000/docs

## Run with Docker (production)

```bash
docker build -t synseafy-api backend
docker run -p 8000:8000 -e ALLOWED_ORIGINS=https://music.wynnsea.my.id synseafy-api
```

The container listens on `$PORT` (default 8000), which most hosts (Render,
Railway, Fly.io, Cloud Run) set automatically.

## Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{ "status": "ok" }` |
| GET | `/api/search?q=…&limit=20` | Songs matching the query |
| GET | `/api/home` | Trending chart, quick picks, popular artists (for `YTM_LOCATION`) |
| GET | `/api/tracks/{videoId}` | The song plus up to 25 songs YouTube Music would play next |
| GET | `/api/tracks/{videoId}/lyrics` | Lyrics, with per-line start times when available |

Responses use camelCase. Upstream failures return `502`, bad ids `400`.

## Configuration

Copy `.env.example` to `.env` (or set the variables in your host):

| Variable | Default | Purpose |
|---|---|---|
| `ALLOWED_ORIGINS` | `http://localhost:3000,https://music.wynnsea.my.id` | Browser origins allowed by CORS |
| `YTM_LOCATION` | `ID` | Country for charts and the home feed |
| `YTM_LANGUAGE` | `en` | Language of YouTube Music responses |

Responses are cached in memory (search 10 min, home 30 min, song info and lyrics
24 h) to keep traffic to YouTube Music low.
