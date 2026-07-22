import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send } from "lucide-react";

const prompts = [
  "Crée une vidéo d'un coucher de soleil sur Dakar, style cinéma",
  "Génère une pub animée pour une marque de café sénégalais",
  "Fais un court-métrage d'animation sur un griot moderne",
  "Crée une série IA inspirée de la culture Wolof",
  "Génère une voix-off en français pour mon film",
];

export default function HeroChat() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  useEffect(() => {
    const fullText = prompts[currentIdx];
    let timeout;
    if (phase === "typing") {
      if (displayed.length < fullText.length) {
        timeout = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length + 1)), 38);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1500);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 1300);
    } else if (phase === "deleting") {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
      } else {
        setCurrentIdx((i) => (i + 1) % prompts.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, phase, currentIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="relative mt-10 w-full max-w-xl mx-auto lg:mx-0"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl bg-card/80 backdrop-blur border border-border overflow-hidden glow-red-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/50">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Story221 Studio</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 min-h-[128px]">
          <div className="flex justify-end">
            <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md bg-primary text-white text-sm leading-snug">
              {displayed}
              <span className="inline-block w-0.5 h-3.5 bg-white/80 ml-0.5 align-middle animate-pulse" />
            </div>
          </div>
          <AnimatePresence>
            {phase === "pausing" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-secondary border border-border text-sm text-muted-foreground">
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-secondary/30">
          <div className="flex-1 px-3 py-2 rounded-lg bg-background/50 text-xs text-muted-foreground">
            Décrivez votre idée...
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}