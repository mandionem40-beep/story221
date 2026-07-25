import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getVideoThumbnail, getCachedThumbnail } from "@/lib/video-thumbnail";

/**
 * AutoVideo — instant-play video with a real frame as poster.
 *
 * Optimized for mobile:
 * - preload="none" initially → NO bandwidth used until the video
 *   scrolls near the viewport. Only the poster (cached thumbnail)
 *   is shown.
 * - When the video enters the viewport (150px margin), preload
 *   switches to "auto" and playback starts.
 * - Pauses when scrolled away — frees CPU/GPU for visible videos.
 * - Only visible videos download → no bandwidth contention on mobile.
 *
 * The poster is a TRUE frame from the video, persisted to localStorage
 * so it's instant on repeat visits (zero black flash).
 */
export default function AutoVideo({
  src,
  className,
  active: controlledActive,
  onReady,
  ...props
}) {
  const videoRef = useRef(null);
  const preloadSetRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(() => getCachedThumbnail(src));

  const isActive = controlledActive ?? visible;

  // Generate real video-frame thumbnail if not cached yet
  useEffect(() => {
    let cancelled = false;
    preloadSetRef.current = false;
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
      { threshold: 0.01, rootMargin: "150px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [controlledActive]);

  // Play / pause based on active state
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (isActive) {
      // Switch from "none" to "auto" on first activation — triggers download
      if (!preloadSetRef.current) {
        v.preload = "auto";
        v.load();
        preloadSetRef.current = true;
      }
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

  if (!src) return null;

  return (
    <div className="absolute inset-0 bg-card overflow-hidden">
      {/* Poster layer — ALWAYS visible as background, never removed. */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Video layer — fades in on top only when actually playing */}
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload="none"
        onPlaying={handlePlaying}
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