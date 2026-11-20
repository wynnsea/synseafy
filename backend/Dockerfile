# Synseafy API (FastAPI + ytmusicapi)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

# Run as a non-root user
RUN useradd --create-home appuser
USER appuser

# Most hosts (Render, Railway, Fly, Cloud Run) inject $PORT; default 8000 locally
ENV PORT=8000
EXPOSE 8000
# --proxy-headers: trust X-Forwarded-* from the host's load balancer (HTTPS)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*'"]
