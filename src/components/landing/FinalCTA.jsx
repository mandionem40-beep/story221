import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 text-center"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
          <div className="absolute inset-0 bg-glow-red opacity-50" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm text-white font-medium">Offre de bienvenue</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight">
              Commencez votre première création <span className="gradient-text-red">gratuitement</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
              Recevez une vidéo IA offerte dès votre inscription. Aucune carte requise.
            </p>

            <a
              href="/register"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-base sm:text-lg hover:bg-primary/90 transition-all glow-red hover:scale-[1.02]"
            >
              Créer mon compte
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}