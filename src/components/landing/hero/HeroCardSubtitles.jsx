import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Captions } from "lucide-react";
import HeroCard from "./HeroCard";

const LINES = ["Créez des vidéos", "qui captivent", "votre audience"];

export default function HeroCardSubtitles({ delay = 0, floatDelay = 0, float = true, className }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % LINES.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <HeroCard label="Sous-titres" icon={Captions} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div className="relative aspect-square rounded-xl bg-black/70 flex flex-col items-center justify-center p-3 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-[11px] text-white text-center font-medium leading-snug"
          >
            {LINES[index]}
          </motion.p>
        </AnimatePresence>
        <div className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-white/10 overflow-hidden">
          <div key={index} className="h-full bg-primary animate-subtitle-bar" />
        </div>
      </div>
    </HeroCard>
  );
}