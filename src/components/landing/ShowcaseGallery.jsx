import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import ShowcaseVideoCard from "@/components/landing/ShowcaseVideoCard";
import { preloadVideos } from "@/lib/video-preloader";

export default function ShowcaseGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.ShowcaseVideo.filter({ active: true }, "display_order", 8);
        setVideos(list || []);
        // Preload showcase videos + generate thumbnails immediately
        if (list && list.length > 0) {
          preloadVideos(list.map((v) => v.video_url).filter(Boolean));
        }
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
          <div className="flex justify-center py-12">
            <p className="text-sm text-muted-foreground">Bientôt des exemples de créations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {videos.map((video) => (
              <ShowcaseVideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}