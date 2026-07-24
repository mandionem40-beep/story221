export const characterCategories = [
  {
    id: "animal", label: "Animal", emoji: "🐾", desc: "Crée des histoires avec des personnages animaux pleins de vie.",
    image: "https://images.unsplash.com/photo-1546975490-e8b92a360b24?w=200&q=80",
    appearances: [
      { emoji: "🦁", label: "Lion" }, { emoji: "🐘", label: "Éléphant" }, { emoji: "🐒", label: "Singe" },
      { emoji: "🐱", label: "Chat" }, { emoji: "🐶", label: "Chien" }, { emoji: "🦅", label: "Aigle" },
      { emoji: "🐰", label: "Lapin" }, { emoji: "🐯", label: "Tigre" }, { emoji: "🐻", label: "Ours" },
      { emoji: "🐧", label: "Pingouin" },
    ],
  },
  {
    id: "fruit", label: "Fruit / Aliment", emoji: "🍓", desc: "Des drames viraux avec des fruits et aliments animés.",
    image: "https://images.unsplash.com/photo-1543528176-61b239494933?w=200&q=80",
    appearances: [
      { emoji: "🍓", label: "Fraise" }, { emoji: "🍌", label: "Banane" }, { emoji: "🍎", label: "Pomme" },
      { emoji: "🍊", label: "Orange" }, { emoji: "🥭", label: "Mangue" }, { emoji: "🍍", label: "Ananas" },
      { emoji: "🍉", label: "Pastèque" }, { emoji: "🍇", label: "Raisin" },
    ],
  },
  {
    id: "person", label: "Personne", emoji: "🧑", desc: "Des personnages humains réalistes ou stylisés.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    appearances: [
      { emoji: "👦", label: "Garçon" }, { emoji: "👧", label: "Fille" }, { emoji: "👨", label: "Homme" },
      { emoji: "👩", label: "Femme" }, { emoji: "🧓", label: "Aîné" }, { emoji: "🧒", label: "Enfant" },
      { emoji: "🤴", label: "Roi" }, { emoji: "👸", label: "Reine" }, { emoji: "🦸", label: "Héros" },
      { emoji: "🧙", label: "Magicien" },
    ],
  },
  {
    id: "object", label: "Objet", emoji: "📦", desc: "Donnez vie à des objets du quotidien avec l'IA.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecdced?w=200&q=80",
    appearances: [
      { emoji: "🤖", label: "Robot" }, { emoji: "💡", label: "Lampe" }, { emoji: "📱", label: "Téléphone" },
      { emoji: "📖", label: "Livre" }, { emoji: "⚔️", label: "Épée" }, { emoji: "👑", label: "Couronne" },
      { emoji: "🗝️", label: "Clé" }, { emoji: "🕐", label: "Horloge" },
    ],
  },
  {
    id: "vehicle", label: "Véhicule", emoji: "🚗", desc: "Des aventures à toute vitesse avec véhicules animés.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80",
    appearances: [
      { emoji: "🚗", label: "Voiture" }, { emoji: "🚚", label: "Camion" }, { emoji: "🏍️", label: "Moto" },
      { emoji: "🚤", label: "Bateau" }, { emoji: "✈️", label: "Avion" }, { emoji: "🚂", label: "Train" },
      { emoji: "🚀", label: "Fusée" }, { emoji: "🚌", label: "Bus" },
    ],
  },
  {
    id: "place", label: "Lieu / Décor", emoji: "🏠", desc: "Explorez des décors et lieux extraordinaires.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&q=80",
    appearances: [
      { emoji: "🏰", label: "Château" }, { emoji: "🌳", label: "Forêt" }, { emoji: "🏙️", label: "Ville" },
      { emoji: "🏖️", label: "Plage" }, { emoji: "⛰️", label: "Montagne" }, { emoji: "🏠", label: "Maison" },
      { emoji: "🛸", label: "Station spatiale" }, { emoji: "🏝️", label: "Île" },
    ],
  },
  {
    id: "creature", label: "Créature imaginaire", emoji: "✨", desc: "Inventez des créatures fantastiques et mythiques.", isNew: true,
    image: "https://images.unsplash.com/photo-1559666126-84f389727b9a?w=200&q=80",
    appearances: [
      { emoji: "🐉", label: "Dragon" }, { emoji: "🦄", label: "Licorne" }, { emoji: "👾", label: "Monstre" },
      { emoji: "👽", label: "Alien" }, { emoji: "👻", label: "Fantôme" }, { emoji: "🧚", label: "Fée" },
      { emoji: "🧜", label: "Sirène" }, { emoji: "🔥", label: "Phénix" },
    ],
  },
];

export const colors = [
  { id: "red", label: "Rouge", hex: "#ef4444" },
  { id: "blue", label: "Bleu", hex: "#3b82f6" },
  { id: "green", label: "Vert", hex: "#22c55e" },
  { id: "yellow", label: "Jaune", hex: "#eab308" },
  { id: "purple", label: "Violet", hex: "#a855f7" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "pink", label: "Rose", hex: "#ec4899" },
  { id: "black", label: "Noir", hex: "#1e1e1e" },
  { id: "white", label: "Blanc", hex: "#f5f5f5" },
  { id: "gold", label: "Or", hex: "#fbbf24" },
  { id: "silver", label: "Argent", hex: "#cbd5e1" },
  { id: "teal", label: "Turquoise", hex: "#14b8a6" },
];

export const visualStyles = [
  { id: "realiste", label: "Réaliste", desc: "Photo-réaliste" },
  { id: "pixar", label: "Pixar", desc: "Animation 3D" },
  { id: "anime", label: "Anime", desc: "Style japonais" },
  { id: "cartoon", label: "Cartoon 2D", desc: "Dessin animé" },
  { id: "claymation", label: "Claymation", desc: "Pâte à modeler" },
];

export const personalityTraits = [
  "Drôle", "Romantique", "Courageux", "Timide", "Sage", "Excentrique",
  "Gentil", "Mystérieux", "Aventurier", "Calme", "Têtu", "Curieux",
];

export const quickDurations = [
  { id: "30s", label: "30 sec", minutes: 0.5, cost: 5 },
  { id: "1min", label: "1 min", minutes: 1, cost: 10 },
  { id: "3min", label: "3 min", minutes: 3, cost: 30 },
  { id: "5min", label: "5 min", minutes: 5, cost: 50 },
  { id: "10min", label: "10 min", minutes: 10, cost: 100 },
];

export const quickVoices = [
  { id: "river", label: "River", desc: "Calme, neutre" },
  { id: "honey", label: "Honey", desc: "Chaleureux, doux" },
  { id: "sunny", label: "Sunny", desc: "Vif, entraînant" },
  { id: "storm", label: "Storm", desc: "Formel, autoritaire" },
  { id: "spark", label: "Spark", desc: "Énergique, rapide" },
];

export const quickLanguages = [
  { id: "Français", label: "Français", flag: "🇫🇷", sample: "Bonjour, je suis votre narrateur." },
  { id: "Wolof", label: "Wolof", flag: "🇸🇳", sample: "Salaam aleekum, ma ngi tudd River." },
  { id: "Anglais", label: "English", flag: "🇬🇧", sample: "Hello, I am your narrator." },
];

export const quickMusics = [
  { id: "Joyeuse", label: "Joyeuse", emoji: "🎉" },
  { id: "Dramatique", label: "Dramatique", emoji: "🎭" },
  { id: "Romantique", label: "Romantique", emoji: "💕" },
  { id: "Épique", label: "Épique", emoji: "⚔️" },
  { id: "Comique", label: "Comique", emoji: "😂" },
];

export const quickFormats = [
  { id: "vertical", label: "Vertical", desc: "Reels / TikTok", ratio: "9:16" },
  { id: "horizontal", label: "Horizontal", desc: "YouTube", ratio: "16:9" },
  { id: "square", label: "Carré", desc: "Instagram", ratio: "1:1" },
];

export const defaultScenarios = [
  { title: "Tombe amoureux/amoureuse", emoji: "💘", description: "Le personnage vit une histoire d'amour inattendue", requires_second_character: true },
  { title: "Part à l'aventure", emoji: "🏆", description: "Le personnage se lance dans une quête palpitante", requires_second_character: false },
  { title: "Situation embarrassante", emoji: "😂", description: "Le personnage traverse un moment gênant et drôle", requires_second_character: false },
  { title: "Fête un événement", emoji: "🎉", description: "Le personnage célèbre un moment spécial", requires_second_character: false },
  { title: "Résout un mystère", emoji: "🕵️", description: "Le personnage mène l'enquête sur un mystère", requires_second_character: false },
  { title: "Affronte un rival", emoji: "🥊", description: "Le personnage fait face à un adversaire redoutable", requires_second_character: true },
];

const funNames = [
  "Mandione", "Yama", "Bouki", "Leuk", "Kumba", "Samba", "Awa", "Modou",
  "Fatou", "Moussa", "Bineta", "Ousmane", "Adja", "Ibrahima", "Coumba",
  "Pape", "Khadija", "Cheikh", "Ndèye", "Serigne", "Bakary", "Diariatou",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function randomizeCharacter() {
  const category = pick(characterCategories);
  return {
    category: category.id,
    appearance: pick(category.appearances),
    color: pick(colors),
    visualStyle: pick(visualStyles),
    traits: [...personalityTraits].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2)),
    name: pick(funNames),
  };
}

export function pickRandomScenario(scenarios) {
  const list = scenarios.length > 0 ? scenarios : defaultScenarios;
  return pick(list);
}

export function buildPrompt(character, story, settings) {
  const cat = characterCategories.find(c => c.id === character.category);
  const langLabel = settings.language === "Wolof" ? "en wolof" : settings.language === "Anglais" ? "en anglais" : "en français";
  let prompt = `Crée une vidéo ${langLabel} mettant en scène ${character.name || "un personnage"}`;
  prompt += `, un(e) ${character.appearance?.label || cat?.label || "personnage"} de couleur ${character.color?.label || "non spécifiée"}`;
  prompt += ` dans un style visuel ${character.visualStyle?.label || "cinématique"}`;
  if (character.traits && character.traits.length > 0) {
    prompt += `. Personnalité: ${character.traits.join(", ")}`;
  }
  if (story.scenario) {
    prompt += `. Scénario: ${story.scenario.title}`;
    if (story.scenario.description) prompt += ` — ${story.scenario.description}`;
  }
  if (story.secondCharacter) {
    const sc = story.secondCharacter;
    prompt += `. Un second personnage nommé ${sc.name}`;
    if (sc.appearance) prompt += `, un(e) ${sc.appearance}`;
    if (sc.personality_traits && sc.personality_traits.length > 0) prompt += ` (${sc.personality_traits.join(", ")})`;
    prompt += `, rejoint l'histoire et interagit avec le personnage principal`;
  }
  if (story.detail && story.detail.trim()) {
    prompt += `. Détail important: ${story.detail.trim()}`;
  }
  prompt += `. Durée souhaitée: ${settings.duration.minutes} minute(s). Format: ${settings.format}.`;
  return prompt;
}