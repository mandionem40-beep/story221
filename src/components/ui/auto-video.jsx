import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * AutoVideo — instant-play video with no empty cage.
 *
 * Key differences from the old version:
 * - preload="auto" ALWAYS (never "metadata") — the browser starts
 *   downloading immediately on mount, not when scrolled into view.
 * - No IntersectionObserver gate: the video element exists and loads from
 *   the first render, so by the time it's visible the first frame is often
 *   already decoded.
 * - Optional `posterSrc` (static image URL): shown instantly at opacity-1
 *   while the video buffers, then crossfaded out when the video is ready.
 *   This eliminates the empty/black cage entirely.
 * - The video element itself is always rendered (opacity-0 → opacity-1
 *   crossfade when canPlay fires), so there's never a gap.
 *
 * Combined with the global video preloader (src/lib/video-preloader.js),
 * repeat visits are fully instant — the videos are in the browser disk cache.
 */
export default function AutoVideo({
  src,
  posterSrc,
  className,
  active: controlledActive,
  onReady,
  ...props
}) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [canPlay, setCanPlay] = useState(false);

  const isActive = controlledActive ?? visible;

  // Observe visibility to play/pause (but NOT to gate preload — preload is
  // always "auto" so the video downloads immediately regardless of position).
  useEffect(() => {
    if (controlledActive !== undefined) return;
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01, rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [controlledActive]);

  // Play / pause based on active state
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (isActive) {
      const p = v.play();
      if (p && p.catch) {
        p.catch(() => {
          const retry = () => {
            v.play().catch(() => {});
          };
          v.addEventListener("canplay", retry, { once: true });
        });
      }
    } else {
      v.pause();
    }
  }, [isActive, src]);

  const handleCanPlay = () => {
    if (!canPlay) {
      setCanPlay(true);
      onReady?.();
    }
  };

  if (!src) return null;

  return (
    <>
      {/* Static image fallback — instant, no network round-trip for the
          frame. Crossfades out when the video is ready. */}
      {posterSrc && !canPlay && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className={cn("absolute inset-0 w-full h-full object-cover", className)}
        />
      )}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        onPlaying={handleCanPlay}
        className={cn(
          "object-cover transition-opacity duration-300",
          canPlay ? "opacity-100" : "opacity-0",
          className
        )}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        {...props}
      />
    </>
  );
}