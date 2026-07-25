const CACHE_NAME = "story221-v3";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ),
    ])
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Navigation requests — serve cached app shell when offline
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((r) => {
          const c = r.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, c));
          return r;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Cache same-origin assets + media CDN + fonts
  if (
    url.origin === self.location.origin ||
    url.hostname.includes("media.base44.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com")
  ) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Stale-while-revalidate
          fetch(request)
            .then((r) => {
              if (r && r.status === 200)
                caches.open(CACHE_NAME).then((c) => c.put(request, r));
            })
            .catch(() => {});
          return cached;
        }
        return fetch(request).then((r) => {
          if (r && r.status === 200) {
            const c = r.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, c));
          }
          return r;
        });
      })
    );
    return;
  }

  e.respondWith(fetch(request).catch(() => caches.match(request)));
});
