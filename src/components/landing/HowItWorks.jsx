import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Écris ton idée",
    description: "Décris ton concept en une phrase. L'IA s'occupe du reste.",
    icon: "✍️",
  },
  {
    number: "02",
    title: "L'IA crée le scénario",
    description: "Script, scènes, personnages et dialogues générés automatiquement.",
    icon: "🧠",
  },
  {
    number: "03",
    title: "Le film est généré",
    description: "Image, voix, musique et montage assemblés en une vidéo cohérente.",
    icon: "🎬",
  },
  {
    number: "04",
    title: "Publie dans les Reels",
    description: "Ta création rejoint le fil communautaire Story221 automatiquement.",
    icon: "📱",
  },
  {
    number: "05",
    title: "Télécharge ta création",
    description: "Une fois publiée, télécharge ton contenu et partage-le partout.",
    icon: "⬇️",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 lg:py-28 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Comment ça marche</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            De l'idée au film en <span className="gradient-text-red">5 étapes</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl mb-4 group hover:border-primary/40 transition-colors">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center glow-red-sm">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}