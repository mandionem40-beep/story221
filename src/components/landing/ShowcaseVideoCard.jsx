import { useState } from "react";
import AutoVideo from "@/components/ui/auto-video";

export default function ShowcaseVideoCard({ video }) {
  const [error, setError] = useState(false);
  const hasVideo = !!video.video_url && !error;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:border-primary/60">
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-primary/0 blur-xl transition-all duration-500 group-hover:bg-primary/25 group-hover:shadow-[0_0_40px_rgba(255,0,51,0.35)]" />

      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        {/* Video — no poster, no thumbnail, visible immediately */}
        {hasVideo ? (
          <AutoVideo
            src={video.video_url}
            onError={() => setError(true)}
            className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 to-secondary" />
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <p className="text-white text-xs font-semibold line-clamp-1">{video.title}</p>
        </div>
      </div>
    </div>
  );
}