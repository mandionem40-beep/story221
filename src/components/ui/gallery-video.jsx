import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getCachedThumbnail,
  getVideoThumbnail,
  isVideoSeen,
  markVideoSeen,
} from "@/lib/video-thumbnail";

// Global semaphore — limits concurrent video downloads to avoid
// bandwidth contention on mobile. Only N videos load at once; the
// rest queue until a slot frees up.
const MAX_CONCURRENT = 3;
let activeCount = 0;
const waitQueue = [];

function acquireSlot() {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waitQueue.push(resolve));
}

function releaseSlot() {
  activeCount = Math.max(0, activeCount - 1);
  if (waitQueue.length > 0 && activeCount < MAX_CONCURRENT) {
    activeCount++;
    waitQueue.shift()();
  }
}

/**
 * GalleryVideo — video player with REAL frame extraction.
 *
 * - Extracts a TRUE frame from the video itself (not a stock image)
 * - Caches it in localStorage → instant on repeat visits, even offline-ish
 * - `preload="auto"` for already-seen videos → browser HTTP cache = instant
 * - `preload="none"` for new videos → zero bandwidth until visible
 * - IntersectionObserver (300px margin) → load + play when near viewport
 * - Concurrent load limiter (max 3) → no bandwidth contention
 * - `onCanPlay` fade-in → video appears only when enough data is buffered
 * - `onWaiting` → poster reappears during buffering stalls (no freeze)
 */
export default function GalleryVideo({ src, poster, className, onReady, ...props }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  // Real frame from video (cached in localStorage) — falls back to `poster` prop
  const [realThumbnail, setRealThumbnail] = useState(() => getCachedThumbnail(src));
  const slotHeldRef = useRef(false);

  const effectivePoster = realThumbnail || poster;
  // If the video has been seen before, preload immediately (HTTP cache = instant)
  const seenBefore = src ? isVideoSeen(src) : false;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01, rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Extract real frame from video when visible (if not already cached)
  useEffect(() => {
    if (!visible || !src || realThumbnail) return;
    let cancelled = false;
    getVideoThumbnail(src).then((thumb) => {
      if (!cancelled && thumb) {
        setRealThumbnail(thumb);
      }
    });
    return () => { cancelled = true; };
  }, [visible, src, realThumbnail]);

  // Acquire a concurrent-load slot when visible, release on scroll-away
  useEffect(() => {
    if (!visible || !src) return;
    // Seen videos don't need the semaphore — they load from HTTP cache
    if (seenBefore) {
      slotHeldRef.current = true;
      const v = videoRef.current;
      if (v) {
        v.preload = "auto";
        v.load();
      }
      return () => { slotHeldRef.current = false; };
    }
    let cancelled = false;
    acquireSlot().then(() => {
      if (cancelled) {
        releaseSlot();
        return;
      }
      slotHeldRef.current = true;
      const v = videoRef.current;
      if (v) {
        v.preload = "auto";
        v.load();
      }
    });
    return () => {
      cancelled = true;
      if (slotHeldRef.current) {
        slotHeldRef.current = false;
        releaseSlot();
      }
    };
  }, [visible, src, seenBefore]);

  // Play / pause based on visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (visible && slotHeldRef.current) {
      const p = v.play();
      if (p && p.catch) {
        p.catch(() => {
          const retry = () => { v.play().catch(() => {}); };
          v.addEventListener("canplay", retry, { once: true });
        });
      }
    } else {
      v.pause();
    }
  }, [visible, src]);

  const handleCanPlay = useCallback(() => {
    setShowVideo(true);
    if (src) markVideoSeen(src);
    onReady?.();
  }, [onReady, src]);

  // Poster reappears during buffering stalls — no frozen frame
  const handleWaiting = useCallback(() => {
    setShowVideo(false);
  }, []);

  if (!src) return null;

  return (
    <div className="absolute inset-0 bg-card overflow-hidden">
      {effectivePoster && (
        <img
          src={effectivePoster}
          alt=""
          aria-hidden="true"
          loading="eager"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            showVideo ? "opacity-0" : "opacity-100 animate-ken-burns"
          )}
        />
      )}
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload={seenBefore ? "auto" : "none"}
        disableRemotePlayback
        onCanPlay={handleCanPlay}
        onPlaying={handleCanPlay}
        onWaiting={handleWaiting}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          showVideo ? "opacity-100" : "opacity-0",
          className
        )}
        style={{
          willChange: "opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
        {...props}
      />
    </div>
  );
}