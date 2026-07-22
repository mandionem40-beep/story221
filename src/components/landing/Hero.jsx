import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Gift, Zap, Diamond, Clapperboard } from "lucide-react";
import HeroDemo from "@/components/landing/HeroDemo";
import HeroChat from "@/components/landing/HeroChat";

const badges = [
{ icon: Gift, label: "1 vidéo offerte" },
{ icon: Zap, label: "Création en quelques minutes" },
{ icon: Diamond, label: "Paiement par crédits" },
{ icon: Clapperboard, label: "Qualité cinéma" }];


export default function Hero() {
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

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.2]">
              {"Transformez vos idées en".split(" ").map((word, i) => (
                <motion.span
                  key={`a-${i}`}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: "easeOut" }}
                  className="inline-block mr-[0.3em]"
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="inline-block gradient-text-red mr-[0.3em]"
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255,0,51,0.3)",
                      "0 0 40px rgba(255,0,51,0.6)",
                      "0 0 20px rgba(255,0,51,0.3)",
                    ],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block"
                >
                  films
                </motion.span>
              </motion.span>
              {"grâce à l'IA.".split(" ").map((word, i) => (
                <motion.span
                  key={`b-${i}`}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.9 + i * 0.12, ease: "easeOut" }}
                  className="inline-block mr-[0.3em]"
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.3 + i * 0.4, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                </motion.span>
              ))}
            </h1>

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
              
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all glow-red hover:scale-[1.02]">
                Créer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#reels"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-secondary border border-border text-white font-semibold text-base hover:bg-secondary/80 transition-all">
                
                <Play className="w-5 h-5" />
                Voir les créations
              </a>
            </motion.div>

            {/* Badges */}
            <motion.div
              className="mt-8 flex flex-wrap gap-2.5 justify-center lg:justify-start"
            >
              {badges.map((badge, i) =>
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -3, scale: 1.04 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/60 border border-border text-xs sm:text-sm text-muted-foreground hover:border-primary/40 hover:text-white hover:bg-secondary transition-colors cursor-default"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="inline-flex"
                  >
                    <badge.icon className="w-3.5 h-3.5 text-primary" />
                  </motion.span>
                  {badge.label}
                </motion.div>
              )}
            </motion.div>

            {/* Animated chat */}
            <HeroChat />
          </div>

          {/* Right: Animated demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative">
            <HeroDemo />
          </motion.div>
        </div>
      </div>
    </section>);

}