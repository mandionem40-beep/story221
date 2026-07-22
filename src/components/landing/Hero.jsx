import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Gift, Zap, Diamond, Clapperboard } from "lucide-react";

const pipelineSteps = [
{ label: "Prompt", icon: "✍️", text: "Une fraise en or tombe amoureuse d'une fraise en argent..." },
{ label: "Scénario", icon: "📖", text: "Mandione, une fraise dorée, rencontre Yama, une fraise d'argent..." },
{ label: "Storyboard", icon: "🎬", text: "Plan 1: Marché · Plan 2: Rencontre · Plan 3: Romance" },
{ label: "Personnages", icon: "🎨", text: "Mandione — fraise dorée · Yama — fraise d'argent" },
{ label: "Film final", icon: "🍿", text: "Une vidéo complète, cohérente, prête à publier." }];


const badges = [
{ icon: Gift, label: "1 vidéo offerte" },
{ icon: Zap, label: "Création en quelques minutes" },
{ icon: Diamond, label: "Paiement par crédits" },
{ icon: Clapperboard, label: "Qualité cinéma" }];


export default function Hero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border mb-6">
              
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs sm:text-sm text-muted-foreground">Le premier studio IA social d'Afrique</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              
              Transformez vos idées en{" "}
              <span className="gradient-text-red">films</span> grâce à l'IA.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              
              Créez des vidéos, films, séries, animations, images, voix et histoires simplement à partir d'un prompt.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all glow-red hover:scale-[1.02]">
                
                Créer gratuitement
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#reels"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-secondary border border-border text-white font-semibold text-base hover:bg-secondary/80 transition-all">
                
                <Play className="w-5 h-5" />
                Voir les créations
              </a>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              
              {badges.map((badge) =>
              <div
                key={badge.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-xs sm:text-sm text-muted-foreground">
                
                  <badge.icon className="w-3.5 h-3.5 text-primary" />
                  {badge.label}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Animated demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative">
            
            




























































            
          </motion.div>
        </div>
      </div>
    </section>);

}