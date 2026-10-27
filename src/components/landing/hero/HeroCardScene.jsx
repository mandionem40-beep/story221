import { useRef, useEffect, useState } from "react";
import { Film } from "lucide-react";
import HeroCard from "./HeroCard";

const SCENE_VIDEO_URL = "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/e6c62fa63_hf_20261015_172438_69f61559-44d2-4bb7-92de-f959073be0ac.mp4";

export default function HeroCardScene({ delay = 0, floatDelay = 0, float = true, className }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.01,
      rootMargin: "100px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <HeroCard label="Scènes réalistes" icon={Film} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div ref={ref} className="relative aspect-square rounded-xl overflow-hidden bg-black">
        {inView ? (
          <video
            src={SCENE_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-black" />
        )}
      </div>
    </HeroCard>
  );
}