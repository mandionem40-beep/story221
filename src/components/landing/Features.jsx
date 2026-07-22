import { motion } from "framer-motion";
import { Film, Image, Palette, Mic, LayoutGrid, Megaphone } from "lucide-react";

const features = [
  {
    icon: Film,
    title: "Vidéo IA",
    description: "Transformez un simple prompt en vidéo complète — scénario, personnages, voix et montage inclus.",
  },
  {
    icon: Image,
    title: "Image IA",
    description: "Générez des images uniques et de haute qualité à partir d'une description textuelle.",
  },
  {
    icon: Palette,
    title: "Anime",
    description: "Créez des animations et dessins animés avec un style cohérent du début à la fin.",
  },
  {
    icon: Mic,
    title: "Voix IA",
    description: "Synthétisez des voix réalistes en français, anglais et wolof pour vos narrations et dialogues.",
  },
  {
    icon: LayoutGrid,
    title: "Storyboard",
    description: "Visualisez votre histoire plan par plan avant même de lancer la génération vidéo.",
  },
  {
    icon: Megaphone,
    title: "Publicité IA",
    description: "Produisez des publicités professionnelles adaptées à votre secteur et à votre marque.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Fonctionnalités</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Un studio complet, <span className="gradient-text-red">propulsé par l'IA</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Tout ce dont vous avez besoin pour créer du contenu de qualité cinéma, en quelques minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl bg-card border border-border p-6 lg:p-8 hover:border-primary/40 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-glow-red opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}