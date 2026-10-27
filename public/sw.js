const CACHE_NAME = "story221-v4";
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

/**
 * Serves a `Range: bytes=start-end` video request from a fully cached 200
 * response. This is what makes loops restart instantly and seeking work
 * offline: the browser never has to re-download anything once cached.
 */
async function serveRange(request, cachedFull) {
  const buf = await cachedFull.clone().arrayBuffer();
  const total = buf.byteLength;
  const range = request.headers.get("range");
  const match = range ? range.match(/^bytes=(\d+)-(\d*)$/) : null;
  const start = match ? parseInt(match[1], 10) : 0;
  const end = match && match[2] ? Math.min(parseInt(match[2], 10), total - 1) : total - 1;
  const chunk = buf.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": cachedFull.headers.get("Content-Type") || "video/mp4",
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Content-Length": String(chunk.byteLength),
      "Accept-Ranges": "bytes",
    },
  });
}

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

  // Media CDN (images + videos) — cache the FULL file once, then serve
  // everything, including range requests, from the cache. Offline playback
  // and instant loop restarts for every video already seen.
  if (url.hostname.includes("media.base44.com")) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        // Only full 200 responses are ever stored, so any hit is complete.
        const cached = await cache.match(url.href);

        // Video range request — slice the cached full file
        if (request.headers.has("range")) {
          if (cached) return serveRange(request, cached);
          // Not cached yet: pass through, never store the partial 206
          return fetch(request);
        }

        if (cached) {
          // Stale-while-revalidate for images
          fetch(request)
            .then((r) => {
              if (r && r.status === 200) cache.put(url.href, r);
            })
            .catch(() => {});
          return cached;
        }

        const r = await fetch(request);
        // Cache only complete, size-known responses (a complete video, a full image)
        if (r && r.status === 200 && r.headers.get("content-length")) {
          cache.put(url.href, r.clone()).catch(() => {});
        }
        return r;
      })()
    );
    return;
  }

  // Same-origin assets + fonts — stale-while-revalidate
  if (
    url.origin === self.location.origin ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com")
  ) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
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
