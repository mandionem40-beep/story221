export const characterCategories = [
  {
    id: "fruit", label: "Fruit'z Story", emoji: "🍓", desc: "Dramas viraux avec personnages à têtes de fruits.",
    body_template: "Personnage 3D animé Pixar/Disney premium, corps humain entièrement réaliste et détaillé, proportions humaines normales, tête remplacée par un [FRUIT/LÉGUME] entier et texturé de façon photoréaliste (peau, reflets, imperfections naturelles conservées), expression du visage expressive et vivante intégrée naturellement sur la texture du fruit/légume (yeux, sourcils, bouche animés comme un vrai visage humain), tenue vestimentaire moderne détaillée cohérente avec la scène, personnages marchant et discutant naturellement dans un décor urbain coloré, éclairage cinématographique chaud, rendu photoréaliste 3D haute définition. ⚠️ CORPS CONSTANT OBLIGATOIRE: tous les personnages de cette famille partagent le MÊME gabarit de corps, le MÊME style de rendu, les MÊMES proportions — seule la tête (le fruit/légume) et la tenue vestimentaire changent selon la personnalisation utilisateur. Style de référence: personnages marchant en groupe sur un trottoir urbain en discutant, comme la vignette de démonstration de la carte.",
    image: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/c4cc78177_image.png",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/576aa66d5_Fruit_z_Story_Walk.mp4",
    appearances: [
      { emoji: "🍓", label: "Fraise" }, { emoji: "🍌", label: "Banane" }, { emoji: "🍎", label: "Pomme" },
      { emoji: "🍊", label: "Orange" }, { emoji: "🥭", label: "Mangue" }, { emoji: "🍍", label: "Ananas" },
      { emoji: "🍉", label: "Pastèque" }, { emoji: "🍇", label: "Raisin" }, { emoji: "🥕", label: "Carotte" },
      { emoji: "🫑", label: "Poivron" }, { emoji: "🍋", label: "Citron" }, { emoji: "🧄", label: "Ail" },
      { emoji: "🍒", label: "Cerise" }, { emoji: "🥑", label: "Avocat" },
    ],
  },
  {
    id: "chocolate", label: "Chocolate Story", emoji: "🍫", desc: "Personnages à tête d'aliment/objet sur corps humain constant.", isNew: true,
    body_template: "Personnage 3D animé Pixar/Disney premium, corps humain réaliste et détaillé, proportions humaines normales, tête remplacée par [ALIMENT/OBJET: tablette de chocolat noir/au lait/blanc, sucette, bouteille, boule de crème glacée, part de pizza, taco, bonbon...] avec sa texture caractéristique conservée fidèlement (brillance du chocolat, transparence de la bouteille, texture givrée de la glace, finitions métalliques/cristallines possibles), expression du visage vivante et expressive intégrée naturellement sur l'objet/aliment, personnages debout discutant et interagissant dans un décor intérieur chaleureux, éclairage dramatique avec reflets sur les surfaces métalliques et cristallines, rendu photoréaliste 3D haute définition. ⚠️ CORPS CONSTANT OBLIGATOIRE: tous les personnages de cette famille partagent le MÊME gabarit de corps, le MÊME style de rendu, les MÊMES proportions — seule la tête (l'aliment/objet) et la tenue vestimentaire changent selon la personnalisation utilisateur. Style de référence: personnages debout en groupe en train de discuter, comme la vignette de démonstration de la carte.",
    image: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/7450226b3_image.png",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/7088609ac_Chocolate_Story_Chat.mp4",
    appearances: [
      { emoji: "🍫", label: "Chocolat Noir" }, { emoji: "🍫", label: "Chocolat au Lait" }, { emoji: "🍫", label: "Chocolat Blanc" },
      { emoji: "🍭", label: "Sucette" }, { emoji: "🍶", label: "Bouteille" }, { emoji: "🍦", label: "Crème Glacée" },
      { emoji: "🍕", label: "Pizza" }, { emoji: "🌮", label: "Taco" }, { emoji: "🍬", label: "Bonbon" },
      { emoji: "🥤", label: "Soda" }, { emoji: "🍩", label: "Donut" }, { emoji: "🧁", label: "Cupcake" },
    ],
  },
  {
    id: "animal", label: "Animaux", emoji: "🐾", desc: "Personnages animaux animés style 3D.",
    body_template: "Personnage animal stylisé 3D Story221. Le style de rendu (textures, proportions cartoon 3D, qualité cinématique) reste constant — seul l'espèce animale change.",
    image: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/656a1b063_image.png",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/682350670_Animaux.mp4",
    appearances: [
      { emoji: "🦁", label: "Lion" }, { emoji: "🐘", label: "Éléphant" }, { emoji: "🐒", label: "Singe" },
      { emoji: "🐱", label: "Chat" }, { emoji: "🐶", label: "Chien" }, { emoji: "🦅", label: "Aigle" },
      { emoji: "🐰", label: "Lapin" }, { emoji: "🐯", label: "Tigre" }, { emoji: "🐻", label: "Ours" },
      { emoji: "🐧", label: "Pingouin" },
    ],
  },
  {
    id: "person", label: "YouTuber", emoji: "🎥", desc: "Crée des vidéos style YouTubeur.",
    body_template: "Personnage humain générique style créateur de contenu Story221. Style visuel moderne et dynamique — seul le visage, l'âge et le genre varient.",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/fea2e4bb9_YouTuber.mp4",
    appearances: [
      { emoji: "👦", label: "Garçon" }, { emoji: "👧", label: "Fille" }, { emoji: "👨", label: "Homme" },
      { emoji: "👩", label: "Femme" }, { emoji: "🧓", label: "Aîné" }, { emoji: "🧒", label: "Enfant" },
      { emoji: "🤴", label: "Roi" }, { emoji: "👸", label: "Reine" }, { emoji: "🦸", label: "Héros" },
      { emoji: "🧙", label: "Magicien" },
    ],
  },
  {
    id: "vehicle", label: "Transport", emoji: "🚌", desc: "BRT, TER, Air Sénégal stylisés (sans logo officiel).",
    body_template: "Véhicule stylisé générique Story221 (type BRT/TER/avion stylisé, SANS logo de marque réelle). Le style visuel reste cohérent — seul le type de véhicule change. Aucun logo officiel exact n'est reproduit.",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/cc44a3452_Transport.mp4",
    appearances: [
      { emoji: "🚗", label: "Voiture" }, { emoji: "🚚", label: "Camion" }, { emoji: "🏍️", label: "Moto" },
      { emoji: "🚤", label: "Bateau" }, { emoji: "✈️", label: "Avion" }, { emoji: "🚂", label: "Train" },
      { emoji: "🚀", label: "Fusée" }, { emoji: "🚌", label: "Bus" },
    ],
  },
  {
    id: "place", label: "Lieux", emoji: "🏛️", desc: "Monuments, villes et paysages stylisés.",
    body_template: "Vues panoramiques cinématographiques des lieux iconiques du Sénégal: Mausolée de Seydina Limamou Laye à Yoff (dôme vert sur la plage au coucher de soleil, avec fidèles Laye habillés en blanc assis sur le sable), Mosquée de la Divinité (minarets blancs et dômes verts sur le rivage, pirogues colorées sur le sable), Monument de la Renaissance (statue de bronze colossale homme-femme-enfant sur piédestal), Île de Gorée (vue aérienne de l'île aux toits rouges entourée d'eau turquoise), Palais de la République (bâtiment néoclassique blanc avec drapeau sénégalais), Corniche Ouest (route côtière avec palmiers, océan et Monument de la Renaissance au loin). Style drone 4K, lumière dorée.",
    image: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/71550b7b1_image.png",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/3ca8139c6_Lieux_Sngal_Cinmatique.mp4",
    appearances: [
      { emoji: "🏰", label: "Château" }, { emoji: "🌳", label: "Forêt" }, { emoji: "🏙️", label: "Ville" },
      { emoji: "🏖️", label: "Plage" }, { emoji: "⛰️", label: "Montagne" }, { emoji: "🏠", label: "Maison" },
      { emoji: "🛸", label: "Station spatiale" }, { emoji: "🏝️", label: "Île" },
    ],
  },
  {
    id: "object", label: "Publicité", emoji: "📢", desc: "Crée des publicités pour ta marque (logo fourni par toi).",
    body_template: "Publicité cinématographique hyper-réaliste style Story221. Mascotte anthropomorphe (vache Laicran) en 3D: tête de vache cartoon avec museau blanc, taches noires autour de grands yeux expressifs, cornes sombres courbées, sourire amical. Tenue: t-shirt blanc col bleu avec logo 'Laicran' sur la poitrine et slogan 'Le lait qui nourrit toute la famille', jean bleu avec ceinture en cuir brun. Mascotte tenant le produit (sachet bleu Laicran avec en-tête rouge) dans un champ pastoral vert avec clôtures en bois, collines, ciel bleu avec nuages, éclaboussures de lait réaliste autour. ⚠️ CORPS CONSTANT OBLIGATOIRE: la mascotte garde le MÊME design, les MÊMES proportions, le MÊME style de rendu — seule la pose, l'animation et la personnalisation utilisateur changent.",
    image: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/6c0022596_image.png",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/676af47d7_Pub_Lait_Laicran_Cow.mp4",
    appearances: [
      { emoji: "🥛", label: "Lait Laicran" }, { emoji: "🥤", label: "Jus Préséa" },
      { emoji: "🤖", label: "Robot" }, { emoji: "💡", label: "Lampe" }, { emoji: "📱", label: "Téléphone" },
      { emoji: "📖", label: "Livre" }, { emoji: "⚔️", label: "Épée" }, { emoji: "👑", label: "Couronne" },
      { emoji: "🗝️", label: "Clé" }, { emoji: "🕐", label: "Horloge" },
    ],
  },
  {
    id: "creature", label: "Créature", emoji: "🐉", desc: "Invente des créatures fantastiques et mythiques.",
    body_template: "Créature fantastique originale style Story221. Le style de rendu 3D reste constant — seul le type de créature change.",
    image: "https://images.unsplash.com/photo-1559666126-84f389727b9a?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/9b2f85645_Crature.mp4",
    appearances: [
      { emoji: "🐉", label: "Dragon" }, { emoji: "🦄", label: "Licorne" }, { emoji: "👾", label: "Monstre" },
      { emoji: "👽", label: "Alien" }, { emoji: "👻", label: "Fantôme" }, { emoji: "🧚", label: "Fée" },
      { emoji: "🧜", label: "Sirène" }, { emoji: "🔥", label: "Phénix" },
    ],
  },
  {
    id: "film", label: "Film", emoji: "🎬", desc: "Des courts-métrages cinématiques immersifs.", isNew: true,
    body_template: "Court-métrage cinématique style Story221. Le style visuel (éclairage, colorimétrie, qualité cinématique) reste constant.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/d7c4910fa_Film.mp4",
    appearances: [
      { emoji: "🎭", label: "Drame" }, { emoji: "😄", label: "Comédie" }, { emoji: "😱", label: "Horreur" },
      { emoji: "💕", label: "Romance" }, { emoji: "🕵️", label: "Thriller" }, { emoji: "🤠", label: "Western" },
    ],
  },
  {
    id: "serie", label: "Série", emoji: "📺", desc: "Des épisodes de série dramatique captivants.", isNew: true,
    body_template: "Série télévisée dramatique réaliste: acteurs professionnels, jeu d'acteur naturel et expressif, décors réalistes contemporains au Sénégal. Qualité streaming premium, éclairage cinématique, colorimétrie chaude, profondeur de champ. Style visuel cohérent avec une production de série haut de gamme.",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/04f2df9b9_Srie_Raliste.mp4",
    appearances: [
      { emoji: "🔥", label: "Drame" }, { emoji: "😂", label: "Sitcom" }, { emoji: "🔪", label: "Crime" },
      { emoji: "🏰", label: "Historique" }, { emoji: "🚀", label: "Sci-Fi" }, { emoji: "👻", label: "Fantastique" },
    ],
  },
  {
    id: "anime", label: "Anime", emoji: "🎏", desc: "Des animations style japonais explosives.", isNew: true,
    body_template: "Animation style japonais Story221. Le style visuel anime reste constant.",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/ff50d1666_Anime.mp4",
    appearances: [
      { emoji: "⚔️", label: "Shonen" }, { emoji: "🌸", label: "Shojo" }, { emoji: "🌑", label: "Seinen" },
      { emoji: "👻", label: "Surnaturel" }, { emoji: "🤖", label: "Mecha" }, { emoji: "🎯", label: "Isekai" },
    ],
  },
  {
    id: "music_clip", label: "Clip Musique", emoji: "🎵", desc: "Des clips musicaux dynamiques et néon.", isNew: true,
    body_template: "Clip musical dynamique style Story221. Le style visuel néon/énergique reste constant.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/190d62bac_Clip_Musique.mp4",
    appearances: [
      { emoji: "🎤", label: "Rap" }, { emoji: "🎸", label: "Rock" }, { emoji: "🥁", label: "Afrobeat" },
      { emoji: "🎹", label: "Électro" }, { emoji: "🎷", label: "Jazz" }, { emoji: "🎻", label: "Classique" },
    ],
  },
  {
    id: "manga", label: "Manga", emoji: "📕", desc: "Des scènes manga animées avec effet de vitesse.", isNew: true,
    body_template: "Scène manga animée style Story221. Le style visuel manga (lignes de vitesse, effets) reste constant.",
    image: "https://images.unsplash.com/photo-1612036782185-5f138d549b39?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/3081193f3_Manga.mp4",
    appearances: [
      { emoji: "💥", label: "Action" }, { emoji: "🌀", label: "Aventure" }, { emoji: "😄", label: "Comédie" },
      { emoji: "💀", label: "Dark" }, { emoji: "🌟", label: "Hero" }, { emoji: "👹", label: "Démon" },
    ],
  },
  {
    id: "african", label: "Histoires Africaines", emoji: "🌍", desc: "Récits inspirés du patrimoine africain.", isNew: true,
    body_template: "Personnages fictionnalisés/éducatifs inspirés du patrimoine et de l'histoire africaine, JAMAIS une personne réelle vivante identifiable. Style visuel Story221 cohérent. Les figures historiques sont traitées de façon éducative et fictionnalisée.",
    image: "https://images.unsplash.com/photo-1515098224017-7b3c4db1d8d4?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/1c8915a4a_Histoires_Africaines.mp4",
    appearances: [
      { emoji: "👑", label: "Roi" }, { emoji: "🛡️", label: "Guerrier" }, { emoji: "🧙", label: "Sage" },
      { emoji: "🌾", label: "Paysan" }, { emoji: "🏺", label: "Artisan" }, { emoji: "🎭", label: "Griot" },
    ],
  },
  {
    id: "influencer", label: "Influenceurs", emoji: "⭐", desc: "Crée et gère tes influenceurs IA.",
    body_template: "Influenceur IA avec identité verrouillée. Cohérence visuelle et vocale absolue sur toutes les publications.",
    redirect: "/app/influencers",
    image: "https://images.unsplash.com/photo-1495803843457-4f2d8d1d1f1f?w=400&q=80",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/ecfeda517_Influenceurs_IA.mp4",
    appearances: [],
  },
  {
    id: "event_card", label: "Carte Événement", emoji: "🦁", desc: "Ayoo, la mascotte des JOJ Dakar 2026, court à travers le Sénégal.", isNew: true,
    body_template: "Mascotte Ayoo — le lion officiel des Jeux Olympiques de la Jeunesse Dakar 2026. Lion anthropomorphe 3D: fourrure brune, crinière brun foncé, museau blanc, portant un t-shirt blanc imprimé 'DAKAR 2026' et un short vert aux couleurs du drapeau sénégalais (rouge, jaune, vert avec étoile verte). Ayoo court joyeusement à travers les lieux iconiques du Sénégal en agitant le drapeau sénégalais: Stade Abdoulaye Wade de Diamniadio (stade ovale blanc), Dakar Arena (arène circulaire aux panneaux colorés), courses de pirogues en mer près de la Mosquée de la Divinité, et course cycliste sur la Corniche Ouest au bord de la plage et du Monument de la Renaissance.",
    image: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/0c6f39b18_image.png",
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/c28b60065_Carte_vnement_Ayoo.mp4",
    appearances: [
      { emoji: "🏃", label: "Course" }, { emoji: "🏀", label: "Basket" }, { emoji: "🚣", label: "Pirogue" }, { emoji: "🚴", label: "Cyclisme" },
    ],
  },
];

export const FREE_TRIAL_MINUTES = 1;
export const FREE_TRIAL_COST = 10;

export function calculateFreeTrial(cost, freeTrialUsed) {
  if (freeTrialUsed) return { covered: 0, remaining: cost };
  const covered = Math.min(cost, FREE_TRIAL_COST);
  return { covered, remaining: cost - covered };
}

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
  const category = pick(characterCategories.filter(c => !c.redirect));
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
  if (cat?.body_template) {
    prompt += `\n\n⚠️ CORPS CONSTANT OBLIGATOIRE (gabarit Story221 — ne JAMAIS modifier le style de corps, seul l'élément caractéristique change): ${cat.body_template}`;
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

export function buildChatPrompt(category, userDetail, settings) {
  const langLabel = settings.language === "Wolof" ? "en wolof" : settings.language === "Anglais" ? "en anglais" : "en français";
  let prompt = `Crée une vidéo ${langLabel} dans l'univers « ${category.label} ».`;
  if (category.body_template) {
    prompt += `\n\n⚠️ CORPS CONSTANT OBLIGATOIRE (gabarit Story221 — ne JAMAIS modifier ce style de corps, seul l'élément caractéristique change): ${category.body_template}`;
  }
  prompt += `\n\nPersonnalisation de l'utilisateur (ce qui rend cette création unique): ${userDetail}`;
  prompt += `\nDurée souhaitée: ${settings.duration.minutes} minute(s). Format: ${settings.format}.`;
  if (settings.voice) prompt += ` Voix narrateur: ${settings.voice}.`;
  if (settings.music) prompt += ` Ambiance musicale: ${settings.music}.`;
  prompt += `\nGénère le scénario complet, les scènes, les dialogues et le décor en respectant strictement le corps constant de la catégorie.`;
  return prompt;
}