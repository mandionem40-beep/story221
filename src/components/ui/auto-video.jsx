import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * AutoVideo — instant-play video showing its own first frame as poster.
 *
 * - preload="auto" ALWAYS: the browser starts downloading immediately on
 *   mount, not when scrolled into view.
 * - No IntersectionObserver gate on preload: the video loads from the first
 *   render so the first frame is decoded as early as possible.
 * - No separate poster image: the video element itself shows its first frame
 *   as soon as `loadeddata` fires — no visual "change" between an image and
 *   the video. The video is always at opacity-100.
 * - Play/pause based on visibility to save resources when off-screen.
 *
 * Combined with the global video preloader (src/lib/video-preloader.js),
 * repeat visits are fully instant — videos are in the browser disk cache.
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
  const [ready, setReady] = useState(false);

  const isActive = controlledActive ?? visible;

  // Observe visibility to play/pause (NOT to gate preload).
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
          const retry = () => { v.play().catch(() => {}); };
          v.addEventListener("canplay", retry, { once: true });
        });
      }
    } else {
      v.pause();
    }
  }, [isActive, src]);

  const handleReady = () => {
    if (!ready) {
      setReady(true);
      onReady?.();
    }
  };

  if (!src) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onCanPlay={handleReady}
      onLoadedData={handleReady}
      onPlaying={handleReady}
      className={cn("object-cover", className)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      {...props}
    />
  );
}