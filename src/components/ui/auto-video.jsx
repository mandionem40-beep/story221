import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getVideoThumbnail, getCachedThumbnail } from "@/lib/video-thumbnail";

/**
 * AutoVideo — instant-play video with a real frame as poster.
 *
 * - Poster is a TRUE frame extracted from the video itself (via canvas),
 *   persisted to localStorage → instant on repeat visits, zero black cage.
 * - preload="auto" ALWAYS: browser starts downloading on mount.
 * - Poster stays visible until the video is ACTUALLY playing (onPlaying),
 *   not just "can play" — prevents any black flash on slow connections.
 * - If no poster yet (first visit), video element is visible at opacity-100
 *   so the browser shows its own first frame as soon as data arrives.
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
  const [playing, setPlaying] = useState(false);
  // Synchronous init: check memory cache + localStorage (instant on repeat visits)
  const [poster, setPoster] = useState(() => getCachedThumbnail(src));

  const isActive = controlledActive ?? visible;

  // Generate thumbnail if not cached (only runs once per device per video)
  useEffect(() => {
    let cancelled = false;
    if (!src) return;
    const cached = getCachedThumbnail(src);
    if (cached) {
      setPoster(cached);
      return;
    }
    getVideoThumbnail(src).then((url) => {
      if (!cancelled && url) setPoster(url);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Observe visibility to play/pause
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

  const handlePlaying = () => {
    if (!playing) {
      setPlaying(true);
      onReady?.();
    }
  };

  const handlePause = () => {
    setPlaying(false);
  };

  if (!src) return null;

  // Poster shows when: we have one AND video isn't actively playing yet
  const showPoster = poster && !playing;

  return (
    <>
      {showPoster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
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
        onPlaying={handlePlaying}
        onPause={handlePause}
        onWaiting={handlePause}
        className={cn(
          "object-cover",
          // If poster is showing, hide video until it's playing.
          // If no poster, show video at full opacity so browser can
          // display the first frame as soon as data arrives.
          showPoster ? "opacity-0" : "opacity-100",
          className
        )}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        {...props}
      />
    </>
  );
}