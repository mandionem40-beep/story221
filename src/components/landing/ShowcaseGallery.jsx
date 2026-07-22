import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export default function ShowcaseGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.ShowcaseVideo.filter({ active: true }, "display_order", 8);
        setVideos(list || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section id="showcase" className="pt-8 lg:pt-12 pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Ils ont créé ça avec{" "}
            <span className="gradient-text-red">Story221</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Découvrez des exemples de vidéos, films et publicités créés par notre communauté.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Bientôt des exemples de créations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all cursor-pointer"
                onClick={() => setPlaying(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  {video.video_url ? (
                    <video
                      src={video.video_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                  {video.tags && video.tags.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      {video.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white truncate">{video.title}</h3>
                  {video.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{video.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {playing && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white hover:bg-secondary/70"
              onClick={() => setPlaying(null)}
            >
              <X className="w-4 h-4" />
            </button>
            {playing.video_url ? (
              <video
                src={playing.video_url}
                controls
                autoPlay
                className="w-full rounded-2xl bg-black"
              />
            ) : (
              <img
                src={playing.thumbnail_url}
                alt={playing.title}
                className="w-full rounded-2xl"
              />
            )}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white">{playing.title}</h3>
              {playing.subtitle && <p className="text-sm text-muted-foreground">{playing.subtitle}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}