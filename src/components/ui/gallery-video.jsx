import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * GalleryVideo — ultra-light video player for grid galleries.
 *
 * Replaces AutoVideo's canvas-thumbnail approach with a simple static
 * poster image + lazy video load. Zero canvas extraction, zero
 * localStorage, zero CPU overhead — instant first paint on mobile.
 *
 * - `poster` prop = static image (instant, no network for video)
 * - `preload="none"` initially → zero bandwidth until visible
 * - IntersectionObserver (300px margin) → play when near viewport
 * - Pause when scrolled away → frees CPU/GPU
 */
export default function GalleryVideo({ src, poster, className, onReady, ...props }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

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

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (visible) {
      if (v.preload === "none") {
        v.preload = "auto";
        v.load();
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
  }, [visible, src]);

  const handlePlaying = () => {
    if (!playing) {
      setPlaying(true);
      onReady?.();
    }
  };

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