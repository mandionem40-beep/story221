import { Mic } from "lucide-react";
import HeroCard from "./HeroCard";

export default function HeroCardVoice({ delay = 0, floatDelay = 0, float = true, className }) {
  return (
    <HeroCard label="Voix IA" icon={Mic} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div className="relative aspect-square rounded-xl bg-black/70 flex items-center justify-center gap-1 px-3 overflow-hidden">
        {[0.9, 0.5, 1.1, 0.7, 1.3, 0.6, 1, 0.8, 1.2, 0.5, 0.9, 0.7].map((d, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-primary to-red-400 animate-wave"
            style={{ height: "42%", animationDelay: `${i * 0.12}s`, animationDuration: `${d}s` }}
          />
        ))}
      </div>
    </HeroCard>
  );
}