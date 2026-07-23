import { useState, useRef } from "react";

export default function ShowcaseVideoCard({ video }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  const hasVideo = !!video.video_url && !error;
  const thumb = video.thumbnail_url;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:border-primary/60">
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-primary/0 blur-xl transition-all duration-500 group-hover:bg-primary/25 group-hover:shadow-[0_0_40px_rgba(255,0,51,0.35)]" />

      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        {/* Thumbnail — shows instantly while video loads */}
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Fallback gradient when no thumbnail */}
        {!thumb && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 to-secondary" />
        )}

        {/* Video layer — fades in once ready */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={video.video_url}
            poster={thumb || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setReady(true)}
            onError={() => setError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              ready ? "opacity-100" : "opacity-0"
            } group-hover:scale-105 transition-transform`}
          />
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <p className="text-white text-xs font-semibold line-clamp-1">{video.title}</p>
        </div>
      </div>
    </div>
  );
}