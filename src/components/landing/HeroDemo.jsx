import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, Film, Mic, Palette, Clapperboard } from "lucide-react";

const pipelineSteps = [
  { icon: Sparkles, label: "Prompt", text: "Une fraise en or tombe amoureuse d'une fraise en argent..." },
  { icon: Film, label: "Scénario", text: "Mandione, une fraise dorée, rencontre Yama, une fraise d'argent..." },
  { icon: Palette, label: "Personnages", text: "Mandione — fraise dorée · Yama — fraise d'argent" },
  { icon: Mic, label: "Voix IA", text: "Synthèse vocale en cours..." },
  { icon: Clapperboard, label: "Film final", text: "Une vidéo complète, prête à publier." },
];

export default function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const current = pipelineSteps[step];

  return (
    <div className="relative flex justify-center">
      {/* Phone mockup */}
      <div className="relative w-[260px] sm:w-[300px] h-[520px] rounded-[2.5rem] bg-card border-2 border-border p-3 overflow-hidden glow-red">
        <div className="w-full h-full rounded-[2rem] bg-background overflow-hidden relative">
          {/* Screen content */}
          <div className="absolute inset-0 flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium">Story221</span>
              </div>
              <Play className="w-3.5 h-3.5 text-primary" fill="currentColor" />
            </div>

            {/* Pipeline animation area */}
            <div className="flex-1 flex flex-col items-center justify-center px-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 glow-red-sm">
                    <current.icon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{current.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{current.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pb-6">
              {pipelineSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Bottom result bar */}
            <div className="px-4 pb-5">
              <div className="rounded-xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 p-3 flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((step + 1) / pipelineSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{step + 1}/{pipelineSteps.length} étapes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -top-3 -right-2 sm:right-4 flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border text-xs font-semibold glow-red-sm"
      >
        <span className="text-base">🎬</span>
        <span className="text-white">IA Cinéma</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        className="absolute bottom-8 -left-2 sm:left-4 flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border text-xs font-semibold"
      >
        <span className="text-base">⚡</span>
        <span className="text-white">2 min</span>
      </motion.div>
    </div>
  );
}