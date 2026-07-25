import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getVideoThumbnail, getCachedThumbnail } from "@/lib/video-thumbnail";

/**
 * AutoVideo — instant-play video with a real frame as poster.
 *
 * The poster image is ALWAYS rendered as a background layer — it never
 * disappears. The video element sits on top and fades in (opacity 0→100)
 * only when it is actually playing. This guarantees zero black flash:
 * the poster is visible the entire time until the video takes over.
 *
 * - Poster = TRUE frame extracted from the video (via canvas), persisted
 *   to localStorage → instant on repeat visits, zero black cage.
 * - Background is bg-card (dark, not pure black) so even without a poster
 *   there is no jarring black screen.
 * - preload="auto" always: browser starts downloading on mount.
 * - GPU-accelerated: will-change + translateZ for smooth mobile playback.
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
    return () => { cancelled = true; };
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
          const retry = () => { v.play().catch(() => {}); };
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
    // Don't set playing=false on every pause (e.g. buffering) —
    // only hide if the video actually left the viewport.
    // The IntersectionObserver handles pause when scrolling away.
  };

  if (!src) return null;

  return (
    <div className="absolute inset-0 bg-card overflow-hidden">
      {/* Poster layer — ALWAYS visible as background, never removed */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Video layer — fades in on top only when actually playing */}
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
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          playing ? "opacity-100" : "opacity-0",
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