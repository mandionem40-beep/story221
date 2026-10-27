import { motion, useReducedMotion } from "framer-motion";
import { Shapes } from "lucide-react";
import HeroCard from "./HeroCard";

export default function HeroCardMotion({ delay = 0, floatDelay = 0, float = true, className }) {
  const reduce = useReducedMotion();
  const loop = (animate, transition) =>
    reduce ? {} : { animate, transition };

  return (
    <HeroCard label="Motion design" icon={Shapes} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div className="relative aspect-square rounded-xl bg-black/70 overflow-hidden">
        <motion.span
          className="absolute left-3 top-4 w-10 h-10 rounded-full bg-primary/60 blur-[6px]"
          {...loop({ x: [0, 44, 0], y: [0, 22, 0] }, { duration: 5, repeat: Infinity, ease: "easeInOut" })}
        />
        <motion.span
          className="absolute right-4 bottom-5 w-7 h-7 rounded-lg border-2 border-red-400/70"
          {...loop({ rotate: [0, 180, 360] }, { duration: 8, repeat: Infinity, ease: "linear" })}
        />
        <motion.span
          className="absolute left-4 bottom-6 w-12 h-1 rounded-full bg-gradient-to-r from-primary to-transparent"
          {...loop({ scaleX: [0.4, 1, 0.4] }, { duration: 3, repeat: Infinity, ease: "easeInOut" })}
        />
      </div>
    </HeroCard>
  );
}