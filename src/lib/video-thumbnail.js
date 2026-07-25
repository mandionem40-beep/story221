/**
 * Video Thumbnail Extractor — with persistent localStorage cache.
 *
 * Extracts a real frame from a video file using a hidden <video> + <canvas>,
 * producing a small JPEG data URL used as a poster image.
 *
 * Posters are persisted to localStorage so on repeat visits they are available
 * INSTANTLY (synchronous, zero network) — even on the weakest connection.
 *
 * The extracted thumbnail is a TRUE frame from the video — not a separate
 * stock image — so there's no visual "change" between poster and video.
 */

const thumbnailCache = new Map(); // url → Promise<string|null>
const resolvedValues = new Map(); // url → string (sync lookup)

const STORAGE_PREFIX = "vthumb_";
const MAX_STORAGE_SIZE = 100; // enough for all universe + showcase videos

function getStorageKey(videoUrl) {
  let hash = 0;
  for (let i = 0; i < videoUrl.length; i++) {
    hash = ((hash << 5) - hash) + videoUrl.charCodeAt(i);
    hash |= 0;
  }
  return STORAGE_PREFIX + Math.abs(hash).toString(36);
}

function getFromStorage(videoUrl) {
  try {
    return localStorage.getItem(getStorageKey(videoUrl)) || null;
  } catch {
    return null;
  }
}

function saveToStorage(videoUrl, dataUrl) {
  try {
    // If localStorage is getting full, evict oldest thumbnail entries
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(STORAGE_PREFIX)
    );
    if (keys.length >= MAX_STORAGE_SIZE) {
      // Evict roughly 20% of oldest entries to make room
      const toRemove = Math.ceil(MAX_STORAGE_SIZE * 0.2);
      keys.slice(0, toRemove).forEach((k) => localStorage.removeItem(k));
    }
    localStorage.setItem(getStorageKey(videoUrl), dataUrl);
  } catch {
    // localStorage might be full — try evicting half the thumbnails and retry once
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(STORAGE_PREFIX)
      );
      keys.slice(0, Math.ceil(keys.length / 2)).forEach((k) =>
        localStorage.removeItem(k)
      );
      localStorage.setItem(getStorageKey(videoUrl), dataUrl);
    } catch {
      // give up — thumbnail stays in memory cache only
    }
  }
}

/**
 * Extract a frame from a video URL.
 * @param {string} videoUrl
 * @param {number} seekTime - seconds to seek (default 0 = first frame)
 * @returns {Promise<string|null>} JPEG data URL or null
 */
export function getVideoThumbnail(videoUrl, seekTime = 0) {
  // 1. Check sync memory cache
  if (resolvedValues.has(videoUrl)) {
    return Promise.resolve(resolvedValues.get(videoUrl));
  }

  // 2. Check localStorage (synchronous, instant on repeat visits)
  const stored = getFromStorage(videoUrl);
  if (stored) {
    resolvedValues.set(videoUrl, stored);
    return Promise.resolve(stored);
  }

  // 3. Already extracting?
  if (thumbnailCache.has(videoUrl)) {
    return thumbnailCache.get(videoUrl);
  }

  // 4. Extract from video
  const promise = new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    let done = false;

    const finish = (result) => {
      if (done) return;
      done = true;
      if (result) {
        resolvedValues.set(videoUrl, result);
        saveToStorage(videoUrl, result);
      }
      resolve(result);
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        /* ignore */
      }
      video.remove();
    };

    const captureFrame = () => {
      try {
        const vw = video.videoWidth || 320;
        const vh = video.videoHeight || 180;
        // Scale down: max 320px wide → small data URL, fast to store/read
        const scale = Math.min(1, 320 / vw);
        const w = Math.round(vw * scale);
        const h = Math.round(vh * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, w, h);
        finish(canvas.toDataURL("image/jpeg", 0.6));
      } catch {
        finish(null);
      }
    };

    // Seek slightly past frame 0 to skip potential black intro frames,
    // then capture on 'seeked' — gives a real, representative frame.
    const onLoaded = () => {
      try {
        video.currentTime = 0.1;
      } catch {
        captureFrame();
      }
    };
    video.addEventListener("loadeddata", onLoaded, { once: true });
    video.addEventListener("seeked", captureFrame, { once: true });
    video.addEventListener("error", () => finish(null), { once: true });
    // Timeout: 10s (generous for weak connections)
    setTimeout(() => finish(null), 10000);
  });

  thumbnailCache.set(videoUrl, promise);
  return promise;
}

/**
 * Synchronous check — returns cached thumbnail from memory or localStorage.
 * Used by AutoVideo for instant poster display on mount.
 */
export function getCachedThumbnail(videoUrl) {
  if (resolvedValues.has(videoUrl)) {
    return resolvedValues.get(videoUrl);
  }
  const stored = getFromStorage(videoUrl);
  if (stored) {
    resolvedValues.set(videoUrl, stored);
    return stored;
  }
  return null;
}

/**
 * Pre-generate thumbnails for a list of video URLs (fire-and-forget).
 */
export function preloadThumbnails(urls) {
  if (!Array.isArray(urls)) return;
  urls.forEach((url) => {
    if (url) getVideoThumbnail(url);
  });
}