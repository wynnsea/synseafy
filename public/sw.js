const CACHE_NAME = "synseafy-pwa-v2";
const PRECACHE_URLS = [
  "/brand/logo-v3.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js internal chunks, HMR, or API calls
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first for HTML navigations with offline cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((res) => res || caches.match("/"))
        )
    );
    return;
  }

  // Cache static brand & icon assets only
  if (
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
