import { useRef, useEffect, useState } from "react";
import { Shapes } from "lucide-react";
import HeroCard from "./HeroCard";

const MOTION_VIDEO_URL = "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/167942bfb_Pinterestvideo774124931963319.mp4";

export default function HeroCardMotion({ delay = 0, floatDelay = 0, float = true, className }) {
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
    <HeroCard label="Motion design" icon={Shapes} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div ref={ref} className="relative aspect-square rounded-xl overflow-hidden bg-black">
        {inView ? (
          <video
            src={MOTION_VIDEO_URL}
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