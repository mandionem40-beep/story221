import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Comment fonctionne Story221 ?",
    a: "Vous écrivez un prompt décrivant votre idée, choisissez quelques options (style, durée, langue, voix...), et l'IA génère automatiquement le scénario, les personnages, les dialogues, la voix, la musique et le montage final en une seule vidéo.",
  },
  {
    q: "Dois-je payer un abonnement ?",
    a: "Non. Story221 fonctionne par crédits (Diamants). Vous achetez uniquement les packs dont vous avez besoin, sans engagement, et vous pouvez créer dès votre inscription.",
  },
  {
    q: "Comment fonctionnent les Diamants ?",
    a: "Les Diamants sont la monnaie virtuelle de Story221. Chaque génération consomme un nombre de diamants calculé selon les options choisies (durée, résolution...). Le coût exact est affiché avant chaque génération, et le solde est déduit uniquement après une création réussie.",
  },
  {
    q: "Puis-je utiliser mes propres personnages ?",
    a: "Oui. Les personnages que vous créez avec le générateur de Personnage IA sont réutilisisables dans toutes vos futures créations, garantissant une cohérence visuelle d'une vidéo à l'autre.",
  },
  {
    q: "Mes vidéos m'appartiennent-elles ?",
    a: "Oui, les contenus que vous créez vous appartiennent. Toute création est d'abord publiée dans le fil communautaire Story221 Reels, puis devient téléchargeable. Les autres utilisateurs ne peuvent jamais télécharger vos vidéos.",
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <span className="text-sm sm:text-base font-semibold text-white">{item.q}</span>
        <ChevronDown
          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Questions <span className="gradient-text-red">fréquentes</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}