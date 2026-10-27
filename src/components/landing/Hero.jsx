import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import HeroNoraStage from "@/components/landing/hero/HeroNoraStage";

export default function Hero() {
  const reduce = useReducedMotion();
  const enter = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: "easeOut" },
  });

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: message */}
          <div className="text-center lg:text-left">
            <motion.div
              {...enter(0)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-primary/30 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs sm:text-sm text-white font-medium">Création vidéo IA</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </motion.div>

            <motion.h1
              {...enter(0.12)}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]"
            >
              Transformez vos idées en{" "}
              <span className="gradient-text-red">vidéos percutantes</span> avec l'IA
            </motion.h1>

            <motion.p
              {...enter(0.24)}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              Créez des vidéos, films, séries, animations, images, voix et histoires
              simplement à partir d'un prompt. Qualité cinéma, en quelques minutes.
            </motion.p>

            <motion.div
              {...enter(0.36)}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all glow-red hover:scale-[1.02]"
              >
                Commencer à créer
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#reels"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-secondary border border-border text-white font-semibold text-base hover:bg-secondary/80 transition-all"
              >
                <Play className="w-5 h-5" />
                Voir les créations
              </a>
            </motion.div>
          </div>

          {/* Right: publicité Bio NORA + cartes flottantes */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <HeroNoraStage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}