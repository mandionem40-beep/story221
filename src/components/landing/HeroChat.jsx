import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Wand2, Film, Check } from "lucide-react";

const scenarios = [
  {
    prompt: "Un mariage de fruits anthropomorphes avec l'inscription MRS MBAYE",
    video: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/a2287461f_Mariage_fruits_v2.mp4",
    label: "Vidéo cinématique",
  },
  {
    prompt: "Air Sénégal — décollage et hôtesses dans un avion de luxe",
    video: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/88193005f_Air_Sngal_dcollage_htesses.mp4",
    label: "Pub premium",
  },
  {
    prompt: "Sadio Mané dribble un lion sur un terrain de foot",
    video: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/eaf4bde31_Sadio_Man_dribble_lion.mp4",
    label: "Animation virale",
  },
];

const steps = [
  "Analyse du prompt par Claude IA",
  "Génération du script & storyboard",
  "Création des personnages & décors",
  "Rendu vidéo cinématique 4K",
];

export default function HeroChat() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | sending | generating | result
  const [displayed, setDisplayed] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const videoRef = useRef(null);
  const scenario = scenarios[scenarioIdx];

  // Typing effect
  useEffect(() => {
    if (phase !== "typing") return;
    const fullText = scenario.prompt;
    if (displayed.length < fullText.length) {
      const t = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length + 1)), 35);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("sending"), 600);
    return () => clearTimeout(t);
  }, [displayed, phase, scenario]);

  // Sending → generating
  useEffect(() => {
    if (phase !== "sending") return;
    const t = setTimeout(() => {
      setPhase("generating");
      setStepIdx(0);
    }, 800);
    return () => clearTimeout(t);
  }, [phase]);

  // Step progression
  useEffect(() => {
    if (phase !== "generating") return;
    if (stepIdx < steps.length - 1) {
      const t = setTimeout(() => setStepIdx(stepIdx + 1), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("result"), 1000);
    return () => clearTimeout(t);
  }, [phase, stepIdx]);

  // Result → reset after delay
  useEffect(() => {
    if (phase !== "result") return;
    const t = setTimeout(() => {
      setDisplayed("");
      setScenarioIdx((i) => (i + 1) % scenarios.length);
      setPhase("typing");
    }, 5500);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="relative mt-8 w-full max-w-xl mx-auto lg:mx-0"
    >
      {/* Animated gradient glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-600/10 to-primary/20 rounded-3xl blur-xl opacity-60 animate-pulse" />

      <div className="relative rounded-3xl bg-card/90 backdrop-blur-xl border border-border overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-secondary/60 to-secondary/20">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-red-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">Story221 Studio</p>
              <p className="text-[10px] text-muted-foreground leading-tight">IA Creative Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium">En ligne</span>
          </div>
        </div>

        {/* Chat body */}
        <div className="p-4 space-y-3 min-h-[200px] flex flex-col justify-end">
          {/* User message bubble */}
          <AnimatePresence>
            {displayed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-red-600 text-white text-sm leading-snug shadow-lg shadow-primary/20">
                  {displayed}
                  {phase === "typing" && (
                    <span className="inline-block w-0.5 h-3.5 bg-white/90 ml-0.5 align-middle animate-pulse" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI processing */}
          <AnimatePresence>
            {phase === "generating" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md bg-secondary border border-border space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Génération en cours…</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-48 h-1 rounded-full bg-background overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-red-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="space-y-1">
                    {steps.map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${i < stepIdx ? "bg-green-500" : i === stepIdx ? "bg-primary" : "bg-muted"}`}>
                          {i < stepIdx ? (
                            <Check className="w-2 h-2 text-white" />
                          ) : i === stepIdx ? (
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                          ) : null}
                        </div>
                        <span className={`text-[10px] ${i <= stepIdx ? "text-white" : "text-muted-foreground"}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video result */}
          <AnimatePresence>
            {phase === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-2xl rounded-bl-md overflow-hidden bg-secondary border border-border shadow-xl">
                  <div className="relative aspect-[9/16] w-44 bg-black">
                    <video
                      ref={videoRef}
                      src={scenario.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur">
                      <Film className="w-2.5 h-2.5 text-primary" />
                      <span className="text-[9px] text-white font-medium">{scenario.label}</span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-[10px] text-white font-semibold">Généré par Story221</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-secondary/30">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 border border-border">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {phase === "typing" ? "Décrivez votre idée…" : phase === "result" ? "Vidéo prête !" : "Génération…"}
            </span>
          </div>
          <motion.div
            animate={phase === "sending" ? { scale: [1, 0.9, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${phase === "result" ? "bg-green-500" : "bg-gradient-to-br from-primary to-red-600"}`}
          >
            {phase === "result" ? (
              <Check className="w-4 h-4 text-white" />
            ) : phase === "generating" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </motion.div>
        </div>
      </div>

      {/* Caption below */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center lg:text-left mt-3 text-xs text-muted-foreground"
      >
        ✨ Vos idées deviennent une animation réelle — propulsé par l'IA
      </motion.p>
    </motion.div>
  );
}