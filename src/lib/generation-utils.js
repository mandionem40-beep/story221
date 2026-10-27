import {
  Film, Image as ImageIcon, Clapperboard, Tv, Palette, Brush,
  Megaphone, LayoutGrid, BookOpen, Music, Mic, UserCircle
} from "lucide-react";

export const contentTypes = [
  { id: "video", label: "Vidéo IA", icon: Film, costType: "per_minute", baseCost: 10, color: "from-red-500/20 to-orange-500/20" },
  { id: "image", label: "Image IA", icon: ImageIcon, costType: "flat", baseCost: 5, color: "from-blue-500/20 to-purple-500/20" },
  { id: "film", label: "Film", icon: Clapperboard, costType: "per_minute", baseCost: 15, color: "from-amber-500/20 to-red-500/20" },
  { id: "serie", label: "Série", icon: Tv, costType: "per_minute", baseCost: 12, color: "from-violet-500/20 to-fuchsia-500/20" },
  { id: "anime", label: "Anime", icon: Palette, costType: "per_minute", baseCost: 10, color: "from-pink-500/20 to-rose-500/20" },
  { id: "cartoon", label: "Cartoon", icon: Brush, costType: "per_minute", baseCost: 10, color: "from-cyan-500/20 to-blue-500/20" },
  { id: "ad", label: "Publicité", icon: Megaphone, costType: "per_minute", baseCost: 8, color: "from-green-500/20 to-emerald-500/20" },
  { id: "storyboard", label: "Storyboard", icon: LayoutGrid, costType: "flat", baseCost: 3, color: "from-yellow-500/20 to-amber-500/20" },
  { id: "story", label: "Histoire", icon: BookOpen, costType: "flat", baseCost: 2, color: "from-indigo-500/20 to-blue-500/20" },
  { id: "music_clip", label: "Clip musical", icon: Music, costType: "per_minute", baseCost: 10, color: "from-purple-500/20 to-pink-500/20" },
  { id: "voice", label: "Voix IA", icon: Mic, costType: "per_minute", baseCost: 3, color: "from-teal-500/20 to-cyan-500/20" },
  { id: "character", label: "Personnage IA", icon: UserCircle, costType: "flat", baseCost: 5, color: "from-orange-500/20 to-red-500/20" },
  { id: "influencer", label: "Influenceur IA", icon: UserCircle, costType: "per_minute", baseCost: 12, color: "from-fuchsia-500/20 to-pink-500/20" },
];

// Moteurs de génération vidéo disponibles pour le client (le coût dépend du moteur choisi)
export const videoEngines = [
  { id: "gemini", label: "Gemini", desc: "Moteur standard — rapide et stable", multiplier: 1 },
  { id: "higgsfield", label: "Higgsfield", desc: "Moteur premium — rendu cinématique avancé", multiplier: 2 },
];

export function isVideoType(typeId) {
  return ["video", "film", "serie", "anime", "cartoon", "ad", "music_clip", "influencer"].includes(typeId);
}

export function calculateCost(typeId, duration = 1, engineId = "gemini") {
  const config = contentTypes.find((t) => t.id === typeId);
  if (!config) return 0;
  let cost = config.costType === "per_minute" ? config.baseCost * duration : config.baseCost;
  const engine = videoEngines.find((e) => e.id === engineId);
  if (isVideoType(typeId) && engine) cost = Math.round(cost * engine.multiplier);
  return cost;
}

export function getContentType(typeId) {
  return contentTypes.find((t) => t.id === typeId) || contentTypes[0];
}

export const styles = ["Cinématique", "Réaliste", "Anime", "3D", "Aquarelle", "BD", "Pixel Art", "Minimaliste"];
export const formats = [
  { id: "vertical", label: "Vertical (9:16)", desc: "Pour Reels" },
  { id: "horizontal", label: "Horizontal (16:9)", desc: "Pour YouTube" },
  { id: "square", label: "Carré (1:1)", desc: "Pour Instagram" },
];
export const voices = [
  { id: "river", label: "River — Calme, neutre" },
  { id: "honey", label: "Honey — Chaleureux, doux" },
  { id: "sunny", label: "Sunny — Vif, entraînant" },
  { id: "storm", label: "Storm — Formel, autoritaire" },
  { id: "spark", label: "Spark — Énergique, rapide" },
];
export const musics = ["Ambiant", "Épique", "Joyeuse", "Mélancolique", "Tendu", "Romantique", "Africaine moderne", "Aucune"];
export const resolutions = ["480p", "720p", "1080p", "4K"];
export const languages = [
  { id: "Français", label: "Français" },
  { id: "Anglais", label: "English" },
  { id: "Wolof", label: "Wolof" },
];

export const adSectors = [
  { id: "electromenager", label: "Électroménager / Cuisine" },
  { id: "telecom", label: "Télécommunications" },
  { id: "mobile_money", label: "Transfert d'argent / Mobile Money" },
  { id: "communication", label: "Communication / Marketing" },
  { id: "transport", label: "Transport public (TER / BRT)" },
];

export function generateReferralCode(username) {
  const base = (username || "USER").substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "") || "USER";
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return base + random;
}

export function getPipelineSteps(typeId) {
  if (typeId === "video" || typeId === "film" || typeId === "serie" || typeId === "anime" || typeId === "cartoon" || typeId === "music_clip" || typeId === "ad") {
    return [
      { id: "script", label: "Amélioration du script", icon: "✍️" },
      { id: "scenes", label: "Découpage en scènes", icon: "🎬" },
      { id: "characters", label: "Génération des personnages", icon: "🎨" },
      { id: "dialogues", label: "Génération des dialogues", icon: "💬" },
      { id: "voice", label: "Synthèse vocale", icon: "🎙️" },
      { id: "video", label: "Génération de la vidéo", icon: "🎥" },
      { id: "subtitles", label: "Sous-titres", icon: "📝" },
      { id: "final", label: "Montage final", icon: "🎞️" },
    ];
  }
  if (typeId === "influencer") {
    return [
      { id: "script", label: "Identité de l'influenceur", icon: "✍️" },
      { id: "characters", label: "Génération du personnage", icon: "🎨" },
      { id: "voice", label: "Synthèse vocale", icon: "🎙️" },
      { id: "video", label: "Génération de la vidéo", icon: "🎥" },
      { id: "subtitles", label: "Sous-titres", icon: "📝" },
      { id: "final", label: "Finalisation", icon: "✨" },
    ];
  }
  if (typeId === "image" || typeId === "character") {
    return [
      { id: "prompt", label: "Amélioration du prompt", icon: "✍️" },
      { id: "generate", label: "Génération de l'image", icon: "🎨" },
    ];
  }
  if (typeId === "voice") {
    return [
      { id: "text", label: "Génération du texte", icon: "✍️" },
      { id: "voice", label: "Synthèse vocale", icon: "🎙️" },
    ];
  }
  if (typeId === "story" || typeId === "storyboard") {
    return [
      { id: "script", label: "Amélioration du script", icon: "✍️" },
      { id: "content", label: "Génération du contenu", icon: "📖" },
    ];
  }
  return [
    { id: "script", label: "Traitement", icon: "✨" },
    { id: "generate", label: "Génération", icon: "🎨" },
  ];
}