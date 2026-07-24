/**
 * Global video preloader — starts loading all known showcase/universe videos
 * the moment the app mounts, before any page renders them.
 *
 * Two things happen per video:
 * 1. A hidden <video preload="auto"> forces the browser to download and cache
 *    the full video file (HTTP cache + disk cache).
 * 2. Once the first frame is available, a REAL thumbnail is extracted via
 *    canvas and cached — so any AutoVideo using the same URL gets an instant
 *    poster (the video's own first frame) with zero black cage.
 *
 * This runs once per session. On repeat visits, videos and thumbnails are
 * already cached → playback and poster display are instant.
 */

import { characterCategories } from "./quick-create-data";
import { getVideoThumbnail } from "./video-thumbnail";

const PRELOADED = new Set();

// Collect every video URL from the category definitions.
const ALL_VIDEO_URLS = characterCategories
  .map((c) => c.video_url)
  .filter(Boolean);

/**
 * Kick off preloading for all known videos. Safe to call multiple times —
 * each URL is only preloaded once per session.
 */
export function preloadAllVideos() {
  if (typeof document === "undefined") return;

  ALL_VIDEO_URLS.forEach((url) => {
    if (PRELOADED.has(url)) return;
    PRELOADED.add(url);

    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.setAttribute("aria-hidden", "true");
    v.style.cssText =
      "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";
    v.src = url;

    v.addEventListener(
      "loadeddata",
      () => {
        v.remove();
        // Pre-generate thumbnail from the now-cached video
        getVideoThumbnail(url);
      },
      { once: true }
    );
    v.addEventListener("error", () => v.remove(), { once: true });
    // Safety: remove after 30s even if it didn't fire.
    setTimeout(() => v.remove(), 30000);
    document.body.appendChild(v);
  });
}

/**
 * Preload a single URL on demand (for dynamically loaded showcase videos).
 * Also generates a thumbnail after the video caches.
 */
export function preloadVideo(url) {
  if (!url || PRELOADED.has(url) || typeof document === "undefined") return;
  PRELOADED.add(url);

  const v = document.createElement("video");
  v.preload = "auto";
  v.muted = true;
  v.setAttribute("aria-hidden", "true");
  v.style.cssText =
    "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";
  v.src = url;
  v.addEventListener(
    "loadeddata",
    () => {
      v.remove();
      getVideoThumbnail(url);
    },
    { once: true }
  );
  v.addEventListener("error", () => v.remove(), { once: true });
  setTimeout(() => v.remove(), 30000);
  document.body.appendChild(v);
}

/**
 * Preload multiple URLs at once (e.g., showcase videos loaded from DB).
 */
export function preloadVideos(urls) {
  if (!Array.isArray(urls)) return;
  urls.filter(Boolean).forEach((url) => preloadVideo(url));
}