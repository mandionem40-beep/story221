import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

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
 * GalleryVideo — ultra-light video player for grid galleries.
 *
 * - `poster` prop = static image (instant, no network for video)
 * - `preload="none"` initially → zero bandwidth until visible
 * - IntersectionObserver (300px margin) → load + play when near viewport
 * - Concurrent load limiter (max 3) → no bandwidth contention on mobile
 * - `onCanPlay` fade-in → video appears only when enough data is buffered
 * - `onWaiting` → poster reappears during buffering stalls (no freeze)
 */
export default function GalleryVideo({ src, poster, className, onReady, ...props }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const slotHeldRef = useRef(false);

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

  // Acquire a concurrent-load slot when visible, release on scroll-away
  useEffect(() => {
    if (!visible || !src) return;
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
  }, [visible, src]);

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
    onReady?.();
  }, [onReady]);

  // Poster reappears during buffering stalls — no frozen frame
  const handleWaiting = useCallback(() => {
    setShowVideo(false);
  }, []);

  if (!src) return null;

  return (
    <div className="absolute inset-0 bg-card overflow-hidden">
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload="none"
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