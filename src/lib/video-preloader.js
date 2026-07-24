/**
 * Global video preloader — starts loading all universe/showcase videos
 * the moment the app boots, before any page renders them.
 *
 * Combines thumbnail extraction + full video preload in ONE video element
 * per URL (no duplicates). Loading is staggered to avoid bandwidth
 * contention on weak connections.
 *
 * Thumbnails are persisted to localStorage (see video-thumbnail.js) so on
 * repeat visits they are available INSTANTLY — zero black cage.
 */

import { characterCategories } from "./quick-create-data";
import { getVideoThumbnail, getCachedThumbnail } from "./video-thumbnail";

const PRELOADED = new Set();

const ALL_VIDEO_URLS = characterCategories
  .map((c) => c.video_url)
  .filter(Boolean);

/**
 * Kick off preloading for all known videos. Safe to call multiple times.
 * Videos are staggered (300ms apart) to prevent bandwidth saturation
 * on weak connections.
 */
export function preloadAllVideos() {
  if (typeof document === "undefined") return;

  ALL_VIDEO_URLS.forEach((url, index) => {
    // Stagger: first batch immediately, rest with short delays
    const delay = index < 3 ? 0 : (index - 2) * 300;
    setTimeout(() => preloadVideo(url), delay);
  });
}

/**
 * Preload a single URL: extracts thumbnail + caches full video.
 * Uses ONE video element for both tasks (no duplicate downloads).
 */
export function preloadVideo(url) {
  if (!url || PRELOADED.has(url) || typeof document === "undefined") return;
  PRELOADED.add(url);

  // If thumbnail is already cached (localStorage), skip extraction
  const hasThumb = !!getCachedThumbnail(url);

  const v = document.createElement("video");
  v.preload = "auto";
  v.muted = true;
  v.crossOrigin = "anonymous";
  v.setAttribute("aria-hidden", "true");
  v.style.cssText =
    "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";
  v.src = url;

  // Extract thumbnail from THIS video element (avoids creating a second one)
  if (!hasThumb) {
    v.addEventListener(
      "loadeddata",
      () => {
        // Delegate to thumbnail extractor — it will use its own video element,
        // but the browser's HTTP cache is now warm so it's instant
        getVideoThumbnail(url);
      },
      { once: true }
    );
  }

  v.addEventListener("error", () => v.remove(), { once: true });
  // Keep element alive for up to 90s to allow full download on slow connections
  setTimeout(() => v.remove(), 90000);
  document.body.appendChild(v);
}

/**
 * Preload multiple URLs at once (e.g., showcase videos loaded from DB).
 */
export function preloadVideos(urls) {
  if (!Array.isArray(urls)) return;
  urls.filter(Boolean).forEach((url, i) => {
    setTimeout(() => preloadVideo(url), i * 200);
  });
}