import { motion } from "framer-motion";
import { Check, Diamond } from "lucide-react";

const packs = [
  { name: "Découverte", diamonds: 50, price: "2 500", popular: false },
  { name: "Créateur", diamonds: 110, price: "5 000", popular: true },
  { name: "Pro", diamonds: 250, price: "10 000", popular: false },
  { name: "Studio", diamonds: 400, price: "15 000", popular: false },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-20 lg:py-28 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Tarifs</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Achetez des <span className="gradient-text-red">Diamants</span>, créez sans limite
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Chaque génération consomme des diamants. Le coût est affiché avant chaque création. Payez en FCFA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 lg:p-8 border transition-all duration-300 ${
                pack.popular
                  ? "bg-card border-primary glow-red"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-semibold whitespace-nowrap glow-red-sm">
                  Le plus populaire
                </span>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">{pack.name}</h3>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Diamond className="w-8 h-8 text-primary" fill="currentColor" />
                  <span className="text-4xl font-bold text-white">{pack.diamonds}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">diamants</p>

                <div className="mt-6 pb-6 border-b border-border">
                  <span className="text-2xl font-bold text-white">{pack.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">FCFA</span>
                </div>

                <ul className="mt-6 space-y-3 text-left">
                  {[
                    `${pack.diamonds} diamants`,
                    "Accès à tous les types de création",
                    "Publication dans les Reels",
                    "Téléchargement après publication",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    pack.popular
                      ? "bg-primary text-white hover:bg-primary/90 glow-red-sm hover:glow-red"
                      : "bg-secondary text-white hover:bg-secondary/80 border border-border"
                  }`}
                >
                  Acheter
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          🎁 Chaque nouvel utilisateur reçoit <span className="text-primary font-semibold">1 génération vidéo gratuite</span> à l'inscription.
        </p>
      </div>
    </section>
  );
}