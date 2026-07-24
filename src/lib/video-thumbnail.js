/**
 * Video Thumbnail Extractor
 *
 * Extracts a real frame from a video file using a hidden <video> + <canvas>,
 * producing a JPEG data URL used as a poster image.
 *
 * The extracted thumbnail is a TRUE frame from the video — not a separate
 * stock image — so there's no visual "change" between poster and video.
 *
 * Results are cached per URL. If CORS or any error prevents extraction,
 * resolves null (graceful fallback — AutoVideo shows the video's first
 * frame directly).
 */

const thumbnailCache = new Map(); // url → Promise<string|null>
const resolvedValues = new Map(); // url → string (sync lookup)

/**
 * Extract a frame from a video URL.
 * @param {string} videoUrl
 * @param {number} seekTime - seconds to seek for the frame (default 0.3)
 * @returns {Promise<string|null>} JPEG data URL or null
 */
export function getVideoThumbnail(videoUrl, seekTime = 0.3) {
  // If already resolved, return immediately
  if (resolvedValues.has(videoUrl)) {
    return Promise.resolve(resolvedValues.get(videoUrl));
  }
  if (thumbnailCache.has(videoUrl)) {
    return thumbnailCache.get(videoUrl);
  }

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
      if (result) resolvedValues.set(videoUrl, result);
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
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 360;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, w, h);
        finish(canvas.toDataURL("image/jpeg", 0.75));
      } catch {
        finish(null);
      }
    };

    video.addEventListener(
      "loadeddata",
      () => {
        try {
          video.currentTime = seekTime;
        } catch {
          captureFrame();
        }
      },
      { once: true }
    );

    video.addEventListener("seeked", captureFrame, { once: true });
    video.addEventListener("error", () => finish(null), { once: true });
    setTimeout(() => finish(null), 5000);
  });

  thumbnailCache.set(videoUrl, promise);
  return promise;
}

/**
 * Synchronous check — returns cached thumbnail data URL or null.
 */
export function getCachedThumbnail(videoUrl) {
  return resolvedValues.get(videoUrl) || null;
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