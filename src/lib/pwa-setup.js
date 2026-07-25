/**
 * PWA Setup — generates manifest + service worker via Blob URLs.
 *
 * The `public/` directory is not writable on this platform, so we create
 * the manifest and service worker dynamically in JavaScript. This works
 * on all modern browsers (Chrome, Firefox, Safari, Edge).
 *
 * - Manifest: Blob URL set on <link rel="manifest"> — browsers re-fetch
 *   when the href changes.
 * - Service Worker: registered from /sw.js first (if the file exists),
 *   then falls back to a Blob URL (works for fetch-based caching on
 *   browsers that accept it; iOS doesn't require a SW for installation).
 */

const MANIFEST = {
  id: "/",
  name: "Story221 — Studio IA Social",
  short_name: "Story221",
  description:
    "Le premier studio IA social d'Afrique. Créez des films, vidéos, séries et publicités à partir d'un simple prompt.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  display_override: ["standalone", "minimal-ui"],
  orientation: "portrait-primary",
  background_color: "#0A0A0A",
  theme_color: "#ff0033",
  categories: ["entertainment", "social", "productivity"],
  lang: "fr",
  dir: "ltr",
  icons: [
    {
      src: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/9ea955134_image.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/9ea955134_image.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/9ea955134_image.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  shortcuts: [
    { name: "Créer", url: "/app/create", description: "Lancer une création IA" },
    { name: "Reels", url: "/app/reels", description: "Fil des Reels" },
    { name: "Diamants", url: "/app/diamonds", description: "Acheter des diamants" },
  ],
};

const SW_CODE = `
const CACHE_NAME = "story221-v2";
const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  ]));
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    e.respondWith(fetch(request).then(r => {
      const c = r.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, c));
      return r;
    }).catch(() => caches.match(request).then(r => r || caches.match("/"))));
    return;
  }

  if (url.origin === self.location.origin || url.hostname.includes("media.base44.com") || url.hostname.includes("fonts.gstatic.com")) {
    e.respondWith(caches.match(request).then(cached => {
      if (cached) {
        fetch(request).then(r => { if (r && r.status === 200) caches.open(CACHE_NAME).then(c => c.put(request, r)); }).catch(() => {});
        return cached;
      }
      return fetch(request).then(r => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, c)); }
        return r;
      });
    }));
    return;
  }

  e.respondWith(fetch(request).catch(() => caches.match(request)));
});
`;

export function setupPWA() {
  // 1. Inject manifest via Blob URL
  try {
    const manifestBlob = new Blob([JSON.stringify(MANIFEST)], {
      type: "application/manifest+json",
    });
    const manifestURL = URL.createObjectURL(manifestBlob);
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = manifestURL;
  } catch {
    // ignore
  }

  // 2. Register service worker
  if ("serviceWorker" in navigator) {
    // Try /sw.js first (works if the file exists on the server)
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // Fallback: register from Blob URL (provides fetch caching
        // on browsers that accept blob: SW registration)
        try {
          const swBlob = new Blob([SW_CODE], { type: "text/javascript" });
          const swURL = URL.createObjectURL(swBlob);
          navigator.serviceWorker.register(swURL).catch(() => {});
        } catch {
          // SW not supported — PWA still works on iOS via meta tags
        }
      });
  }
}