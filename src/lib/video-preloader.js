/**
 * Global video preloader — starts loading all known showcase/universe videos
 * the moment the app mounts, before any page renders them.
 *
 * Creates hidden <video preload="auto"> elements that force the browser to
 * download and cache the full video data. Once cached by the browser HTTP
 * cache, any AutoVideo using the same URL is instant (no network, no black
 * cage — the first decoded frame is ready immediately).
 *
 * This runs once per session. On repeat visits the videos are already in the
 * browser's disk cache, so playback is instant even on cold page load.
 */

import { characterCategories } from "./quick-create-data";

const PRELOADED = new Set();

// Collect every video URL we know about from the category definitions.
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

    // Create a hidden video element that forces the browser to fetch and
    // cache the entire video file. We don't play it — preload="auto" tells
    // the browser to download it aggressively.
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.setAttribute("aria-hidden", "true");
    v.style.cssText =
      "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";
    v.src = url;
    // Remove after it has cached to free the DOM node.
    v.addEventListener("loadeddata", () => {
      v.remove();
    });
    // Safety: remove after 30s even if it didn't fire.
    setTimeout(() => v.remove(), 30000);
    document.body.appendChild(v);
  });
}

/**
 * Preload a single URL on demand (for dynamically loaded showcase videos).
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
  v.addEventListener("loadeddata", () => v.remove());
  setTimeout(() => v.remove(), 30000);
  document.body.appendChild(v);
}