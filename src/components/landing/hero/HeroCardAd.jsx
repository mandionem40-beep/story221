import { useRef, useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import HeroCard from "./HeroCard";
import { NORA_AD_URL } from "./noraAdUrl";

export default function HeroCardAd({ delay = 0, floatDelay = 0, float = true, className }) {
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
    <HeroCard label="Vidéos publicitaires" icon={Megaphone} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div ref={ref} className="relative aspect-square rounded-xl overflow-hidden bg-black">
        {inView ? (
          <video
            src={NORA_AD_URL}
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
        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] text-white/90 bg-black/60 rounded px-1.5 py-0.5 truncate">
          Publicité Bio NORA
        </span>
      </div>
    </HeroCard>
  );
}