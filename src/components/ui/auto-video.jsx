import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * AutoVideo — autoplay video with instant playback, no poster/thumbnail.
 *
 * - No poster image, no thumbnail cover — video shows directly.
 * - preload="auto" for visible videos (browser caches aggressively).
 * - preload="metadata" for off-screen videos (lightweight).
 * - IntersectionObserver plays/pauses based on visibility.
 * - Connection-aware: slow connections use preload="metadata".
 * - Video is visible immediately (opacity:1) — no black screen delay
 *   because preload=auto + the browser's first-frame decode is fast.
 */
export default function AutoVideo({
  src,
  className,
  active: controlledActive,
  onReady,
  ...props
}) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(controlledActive ?? false);
  const [canPlay, setCanPlay] = useState(false);

  // Connection-aware preload
  const conn =
    typeof navigator !== "undefined" &&
    (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
  const isSlow = conn && (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
  const isActive = controlledActive ?? visible;
  const preloadAttr = isSlow ? "metadata" : isActive ? "auto" : "metadata";

  // Observe visibility when not externally controlled
  useEffect(() => {
    if (controlledActive !== undefined) return;
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "200px" }
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

  const handleCanPlay = () => {
    if (!canPlay) {
      setCanPlay(true);
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
      preload={preloadAttr}
      onCanPlay={handleCanPlay}
      onLoadedData={handleCanPlay}
      onPlaying={handleCanPlay}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}