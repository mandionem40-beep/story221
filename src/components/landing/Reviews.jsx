import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  { name: "Aïssatou Diallo", role: "Créatrice de contenu", avatar: "https://i.pravatar.cc/100?img=47", rating: 5, text: "Story221 a transformé ma façon de créer. Je publie 3 fois plus de vidéos et mon engagement a explosé !" },
  { name: "Moussa Ndiaye", role: "Réalisateur indépendant", avatar: "https://i.pravatar.cc/100?img=12", rating: 5, text: "J'ai produit un court-métrage en une journée. La qualité de l'IA est bluffante, vraiment niveau professionnel." },
  { name: "Fatou Sow", role: "Influenceuse mode", avatar: "https://i.pravatar.cc/100?img=44", rating: 5, text: "Les publicités générées m'ont permis de décrocher 4 contrats avec des marques locales. Game changer." },
  { name: "Cheikh Fall", role: "Community manager", avatar: "https://i.pravatar.cc/100?img=33", rating: 5, text: "Le réseau social intégré est génial. Mes clients adorent le format reels vertical façon TikTok." },
  { name: "Aminata Ba", role: "Entrepreneure", avatar: "https://i.pravatar.cc/100?img=45", rating: 5, text: "J'ai créé ma pub en wolof pour cibler le marché local. Résultat : +200% de ventes en une semaine." },
  { name: "Ibrahima Sarr", role: "Musicien", avatar: "https://i.pravatar.cc/100?img=15", rating: 5, text: "Mon clip musical généré par IA a fait 50K vues en 3 jours. Incroyable ce qu'on peut faire avec un prompt." },
  { name: "Mariama Cissé", role: "Formatrice en ligne", avatar: "https://i.pravatar.cc/100?img=49", rating: 5, text: "Les storyboards automatiques m'économisent des heures de travail. Story221 est devenu indispensable." },
  { name: "Ousmane Touré", role: "Agence marketing", avatar: "https://i.pravatar.cc/100?img=51", rating: 5, text: "On a réduit nos coûts de production de 70%. Nos clients sont bluffés par la rapidité d'exécution." },
  { name: "Khadja Mbacké", role: "Bloggeuse lifestyle", avatar: "https://i.pravatar.cc/100?img=20", rating: 5, text: "Interface ultra intuitive. Je ne suis pas technique du tout et je crée des contenus pro en quelques minutes." },
  { name: "Pape Diop", role: "Réalisateur de pub", avatar: "https://i.pravatar.cc/100?img=68", rating: 5, text: "Le système de diamants est malin : je maîtrise mon budget création sans surprise. Top pour les freelances." },
  { name: "Ndèye Gueye", role: "Tatoueuse & artiste", avatar: "https://i.pravatar.cc/100?img=24", rating: 5, text: "Je valorise mon art en vidéos animées. Mes abonnés ont doublé depuis que j'utilise Story221." },
  { name: "Babacar Sy", role: "Founder startup", avatar: "https://i.pravatar.cc/100?img=60", rating: 5, text: "On a généré toute notre campagne de lancement en IA. Investissement minime, impact maximum." },
];

function ReviewCard({ review }) {
  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[340px] mx-3 rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-white">{review.name}</p>
          <p className="text-xs text-muted-foreground">{review.role}</p>
        </div>
        <Quote className="w-5 h-5 text-primary ml-auto" />
      </div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
    </div>
  );
}

export default function Reviews() {
  const row1 = reviews.slice(0, 6);
  const row2 = reviews.slice(6);

  return (
    <section id="avis" className="py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Avis communauté</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Ils <span className="gradient-text-red">adorent</span> Story221
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Plus de 10 000 créateurs utilisent Story221 chaque jour. Voici ce qu'ils en pensent.
          </p>
        </div>
      </div>

      <div className="relative space-y-5">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          {[...row1, ...row1].map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </motion.div>

        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          {[...row2, ...row2].map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}