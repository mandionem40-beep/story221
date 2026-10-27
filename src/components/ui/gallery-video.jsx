import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getCachedThumbnail,
  getVideoThumbnail,
  isVideoSeen,
  markVideoSeen,
} from "@/lib/video-thumbnail";

// Wave-based loader — loads videos in batches of 4.
// The first 4 videos get full bandwidth and load fast; only when
// ALL 4 in the current wave are done does the next batch of 4 start.
// This ensures the top of the gallery is ready before anything else.
const BATCH_SIZE = 4;
let activeCount = 0;
const waitQueue = [];

function acquireSlot() {
  if (activeCount < BATCH_SIZE) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waitQueue.push(resolve));
}

function releaseSlot() {
  activeCount = Math.max(0, activeCount - 1);
  // Only start the next wave when the current batch is fully released
  if (activeCount === 0 && waitQueue.length > 0) {
    const toRelease = Math.min(BATCH_SIZE, waitQueue.length);
    for (let i = 0; i < toRelease; i++) {
      activeCount++;
      waitQueue.shift()();
    }
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
 * - Once visible, the video NEVER hides again — at the loop point or during
 *   a brief buffering stall the last frame simply holds, so the animation
 *   reads as perpetual with zero "reload" flash
 * - While the very first frame is still unavailable (no poster yet), an
 *   animated gradient placeholder keeps the card in motion from the
 *   moment the app opens
 */
export default function GalleryVideo({ src, poster, className, onReady, ...props }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [slotReady, setSlotReady] = useState(false);
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
      setSlotReady(true);
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
      setSlotReady(true);
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
  }, [visible, src, slotReady]);

  const handleCanPlay = useCallback(() => {
    setShowVideo(true);
    if (src) markVideoSeen(src);
    onReady?.();
  }, [onReady, src]);

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
      {!effectivePoster && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-black to-primary/10 animate-pulse" />
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