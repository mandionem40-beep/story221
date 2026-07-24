import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getVideoThumbnail, getCachedThumbnail } from "@/lib/video-thumbnail";

/**
 * AutoVideo — instant-play video with a real frame as poster.
 *
 * - Extracts a TRUE frame from the video itself (via canvas) and uses it as
 *   the poster image. No separate stock image — the poster IS the video's
 *   own frame, so there's no visual "change" between poster and playback.
 * - preload="auto" ALWAYS: the browser starts downloading immediately on
 *   mount, not when scrolled into view.
 * - Poster (extracted frame) shows instantly at opacity-100 while the video
 *   buffers, then crossfades to the playing video when canPlay fires.
 * - Global video preloader (src/lib/video-preloader.js) pre-generates
 *   thumbnails at app boot, so by the time any card mounts the poster is
 *   already in cache → zero black cage, instant display.
 */
export default function AutoVideo({
  src,
  className,
  active: controlledActive,
  onReady,
  ...props
}) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [canPlay, setCanPlay] = useState(false);
  // Start with cached thumbnail if available (synchronous, instant)
  const [poster, setPoster] = useState(() => getCachedThumbnail(src));

  const isActive = controlledActive ?? visible;

  // Generate thumbnail from video (or get from cache)
  useEffect(() => {
    let cancelled = false;
    if (!src) return;
    // Check sync cache first
    const cached = getCachedThumbnail(src);
    if (cached) {
      setPoster(cached);
      return;
    }
    // Otherwise extract from video
    getVideoThumbnail(src).then((url) => {
      if (!cancelled && url) setPoster(url);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Observe visibility to play/pause (NOT to gate preload)
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
      {/* Real video frame as poster — instant, no visual change */}
      {poster && !canPlay && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            className
          )}
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