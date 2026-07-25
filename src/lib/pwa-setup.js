/**
 * PWA Setup — registers the service worker for offline caching.
 *
 * The manifest is served as a real static file at /manifest.json (see index.html).
 * The service worker is at /sw.js (real static file) for proper PWA install support.
 *
 * Both files must be served from same-origin URLs for Chrome/Edge `beforeinstallprompt`
 * to fire reliably. Blob URLs do not work for PWA installation criteria.
 */
export function setupPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // SW registration failed — app still works, just no offline caching
      });
  }
}