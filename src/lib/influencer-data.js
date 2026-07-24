export const contentThemes = [
  "Humour", "Cuisine", "Motivation", "Lifestyle", "Actualité",
  "Mode", "Sport", "Musique", "Voyage", "Tech",
  "Santé", "Éducation", "Gaming", "Beauty", "Business",
];

export const defaultTopicBank = {
  "Humour": [
    { title: "Pendant un entraînement de foot", description: "Une situation hilarante à l'entraînement" },
    { title: "Au marché de Dakar", description: "Une négociation qui tourne mal de façon drôle" },
    { title: "Quand le wifi coupe", description: "La panique quand internet s'arrête" },
  ],
  "Cuisine": [
    { title: "Recette du Thiéboudieune", description: "Le plat national préparé avec une touche personnelle" },
    { title: "Mon petit-déjeuner préféré", description: "Une routine matinale gourmande" },
    { title: "Dessert express 5 minutes", description: "Une recette rapide et gourmande" },
  ],
  "Motivation": [
    { title: "Lève-toi et agis", description: "Un message puissant pour démarrer la journée" },
    { title: "Surmonter l'échec", description: "Transformer une défaite en leçon" },
    { title: "Le pouvoir de la persévérance", description: "Pourquoi ne jamais abandonner" },
  ],
  "Lifestyle": [
    { title: "Ma routine matinale", description: "Comment je commence ma journée" },
    { title: "Une journée sans téléphone", description: "Défi déconnecté réussi" },
    { title: "Organiser sa semaine", description: "Mes astuces de productivité" },
  ],
  "Musique": [
    { title: "Découverte afrobeats", description: "Les sons du moment à connaître" },
    { title: "Mon setup studio", description: "Comment je crée ma musique" },
    { title: "Reprise acoustique", description: "Une chanson réinventée" },
  ],
};

export function buildInfluencerPrompt(influencer, topic, settings) {
  let prompt = `Crée une vidéo avec l'influenceur IA "${influencer.name}".\n`;
  prompt += `Apparence verrouillée: ${influencer.appearance || "personnage"}`;
  if (influencer.color) prompt += `, couleur ${influencer.color}`;
  if (influencer.visual_style) prompt += `, style ${influencer.visual_style}`;
  prompt += `.\n`;
  if (influencer.personality_profile) prompt += `Personnalité: ${influencer.personality_profile}\n`;
  if (influencer.speech_samples?.length > 0) prompt += `Phrases types: ${influencer.speech_samples.join(" / ")}\n`;
  prompt += `Voix: ${influencer.frozen_voice} (figée, ne pas changer).\n`;
  prompt += `Sujet du contenu: ${topic}.\n`;
  if (influencer.content_themes?.length > 0) prompt += `Thématiques: ${influencer.content_themes.join(", ")}.\n`;
  prompt += `Durée: ${settings.duration.minutes} min. Format: ${settings.format}. Langue: ${influencer.frozen_language || "Français"}.\n`;
  prompt += `IMPORTANT: L'apparence, la voix et la personnalité de l'influenceur doivent rester strictement identiques à sa fiche d'identité. Ne modifie jamais son visage, sa voix, ses vêtements ou son style.`;
  return prompt;
}