/**
 * Voice Catalog — Story221
 *
 * Full voice library organized by language (FR, Wolof, EN, Arabic).
 * Each voice has: personality, preview message, and TTS parameters
 * for instant browser-based preview via the Web Speech API.
 *
 * When integration credits are available, these voices can also be
 * generated server-side via GenerateSpeech for higher quality output.
 */

export const voiceLanguages = [
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "wo", label: "Wolof", flag: "🇸🇳" },
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "ar", label: "العربية", flag: "🇸🇦" },
];

// Known browser TTS voice names by gender (for matching)
const MALE_VOICE_NAMES = [
  "thomas", "paul", "grandpere", "yannick", "jorge",
  "daniel", "david", "mark", "alex", "fred", "rishi", "aaron", "guy", "james",
  "maged", "naayf", "hamed",
];
const FEMALE_VOICE_NAMES = [
  "amelie", "marie", "julie", "celine", "virginie",
  "samantha", "zira", "victoria", "karen", "moira", "tessa", "fiona", "susan", "catherine",
  "hoda", "laila", "amira",
];

export const voiceCatalog = [
  // ─── FRANÇAIS ───
  {
    id: "fr_lucas", name: "Lucas", language: "fr", gender: "male", ageCategory: "young",
    personality: "Jeune homme énergique et moderne",
    description: "Homme jeune",
    emoji: "👨", color: "#3b82f6",
    previewText: "Bonjour, je suis Lucas, votre voix IA. Heureux de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 0.9, rate: 1.05, voiceGender: "male" },
  },
  {
    id: "fr_thomas", name: "Thomas", language: "fr", gender: "male", ageCategory: "mature",
    personality: "Homme mature, posé et rassurant",
    description: "Homme mature",
    emoji: "🧔", color: "#6366f1",
    previewText: "Bonjour, je suis Thomas, votre voix IA. Heureux de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 0.75, rate: 0.92, voiceGender: "male" },
  },
  {
    id: "fr_emma", name: "Emma", language: "fr", gender: "female", ageCategory: "young",
    personality: "Jeune femme chaleureuse et dynamique",
    description: "Femme jeune",
    emoji: "👩", color: "#ec4899",
    previewText: "Bonjour, je suis Emma, votre voix IA. Heureuse de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 1.2, rate: 1.0, voiceGender: "female" },
  },
  {
    id: "fr_sophie", name: "Sophie", language: "fr", gender: "female", ageCategory: "mature",
    personality: "Femme élégante, raffinée et douce",
    description: "Femme élégante",
    emoji: "💃", color: "#f472b6",
    previewText: "Bonjour, je suis Sophie, votre voix IA. Heureuse de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 1.1, rate: 0.95, voiceGender: "female" },
  },
  {
    id: "fr_jean", name: "Jean", language: "fr", gender: "male", ageCategory: "mature",
    personality: "Narrateur documentaire grave et captivant",
    description: "Narrateur documentaire",
    emoji: "🎙️", color: "#8b5cf6",
    previewText: "Bonjour, je suis Jean, votre voix IA. Heureux de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 0.78, rate: 0.88, voiceGender: "male" },
  },
  {
    id: "fr_marc", name: "Marc", language: "fr", gender: "male", ageCategory: "young",
    personality: "Voix publicitaire persuasive et entraînante",
    description: "Publicité",
    emoji: "📢", color: "#f97316",
    previewText: "Bonjour, je suis Marc, votre voix IA. Heureux de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 0.92, rate: 1.12, voiceGender: "male" },
  },
  {
    id: "fr_vincent", name: "Vincent", language: "fr", gender: "male", ageCategory: "mature",
    personality: "Voix cinématographique profonde et intense",
    description: "Cinéma",
    emoji: "🎬", color: "#ef4444",
    previewText: "Bonjour, je suis Vincent, votre voix IA. Heureux de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 0.8, rate: 0.93, voiceGender: "male" },
  },
  {
    id: "fr_lea", name: "Léa", language: "fr", gender: "female", ageCategory: "child",
    personality: "Voix d'enfant vive et espiègle",
    description: "Enfant",
    emoji: "👧", color: "#fbbf24",
    previewText: "Bonjour, je suis Léa, votre voix IA. Heureuse de vous accompagner dans la création de votre histoire sur Story221.",
    tts: { lang: "fr-FR", pitch: 1.6, rate: 1.05, voiceGender: "female" },
  },

  // ─── WOLOF ───
  {
    id: "wo_mamadou", name: "Mamadou", language: "wo", gender: "male", ageCategory: "mature",
    personality: "Homme de Dakar, voix grave et authentique",
    description: "Homme Dakar",
    emoji: "👨", color: "#22c55e",
    previewText: "Asalaam maalekum. Maa ngi tudd Mamadou. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 0.85, rate: 0.98, voiceGender: "male" },
  },
  {
    id: "wo_awa", name: "Awa", language: "wo", gender: "female", ageCategory: "mature",
    personality: "Femme de Dakar, chaleureuse et naturelle",
    description: "Femme Dakar",
    emoji: "👩", color: "#f472b6",
    previewText: "Asalaam maalekum. Maa ngi tudd Awa. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 1.15, rate: 1.0, voiceGender: "female" },
  },
  {
    id: "wo_bassirou", name: "Bassirou", language: "wo", gender: "male", ageCategory: "mature",
    personality: "Homme de Casamance, timbre chaud et posé",
    description: "Homme Casamance",
    emoji: "🧔", color: "#16a34a",
    previewText: "Asalaam maalekum. Maa ngi tudd Bassirou. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 0.78, rate: 0.9, voiceGender: "male" },
  },
  {
    id: "wo_fatou", name: "Fatou", language: "wo", gender: "female", ageCategory: "mature",
    personality: "Femme de Casamance, douce et mélodieuse",
    description: "Femme Casamance",
    emoji: "👩‍🦱", color: "#10b981",
    previewText: "Asalaam maalekum. Maa ngi tudd Fatou. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 1.1, rate: 0.95, voiceGender: "female" },
  },
  {
    id: "wo_modou", name: "Modou", language: "wo", gender: "male", ageCategory: "child",
    personality: "Jeune garçon curieux et énergique",
    description: "Jeune garçon",
    emoji: "👦", color: "#84cc16",
    previewText: "Asalaam maalekum. Maa ngi tudd Modou. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 1.1, rate: 1.05, voiceGender: "male" },
  },
  {
    id: "wo_coumba", name: "Coumba", language: "wo", gender: "female", ageCategory: "child",
    personality: "Jeune fille vive et joyeuse",
    description: "Jeune fille",
    emoji: "👧", color: "#fbbf24",
    previewText: "Asalaam maalekum. Maa ngi tudd Coumba. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 1.35, rate: 1.02, voiceGender: "female" },
  },
  {
    id: "wo_serigne", name: "Serigne", language: "wo", gender: "male", ageCategory: "mature",
    personality: "Narrateur solennel et sage",
    description: "Narrateur",
    emoji: "🎙️", color: "#6366f1",
    previewText: "Asalaam maalekum. Maa ngi tudd Serigne. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 0.78, rate: 0.88, voiceGender: "male" },
  },
  {
    id: "wo_pape", name: "Vieux Pape", language: "wo", gender: "male", ageCategory: "elder",
    personality: "Ancien respecté, voix profonde et lente",
    description: "Ancien",
    emoji: "👴", color: "#9ca3af",
    previewText: "Asalaam maalekum. Maa ngi tudd Pape. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 0.65, rate: 0.82, voiceGender: "male" },
  },
  {
    id: "wo_samb", name: "Samb", language: "wo", gender: "male", ageCategory: "mature",
    personality: "Griot traditionnel, voix riche et théâtrale",
    description: "Griot",
    emoji: "🪘", color: "#d97706",
    previewText: "Asalaam maalekum. Maa ngi tudd Samb. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 0.75, rate: 0.9, voiceGender: "male" },
  },
  {
    id: "wo_cheikh", name: "Cheikh", language: "wo", gender: "male", ageCategory: "young",
    personality: "Comédien expressif et plein de vie",
    description: "Comédien",
    emoji: "🎭", color: "#f97316",
    previewText: "Asalaam maalekum. Maa ngi tudd Cheikh. Maa di sa baat bu AI ci Story221. Dama neex ci dimbali la nga sos sa nettali.",
    tts: { lang: "fr-FR", pitch: 0.88, rate: 1.1, voiceGender: "male" },
  },

  // ─── ENGLISH ───
  {
    id: "en_jack", name: "Jack", language: "en", gender: "male", ageCategory: "young",
    personality: "American voice, casual and friendly",
    description: "US Accent",
    emoji: "👨", color: "#3b82f6",
    previewText: "Hello. I'm Jack, your AI voice. I'm excited to bring your story to life on Story221.",
    tts: { lang: "en-US", pitch: 0.9, rate: 1.0, voiceGender: "male" },
  },
  {
    id: "en_olivia", name: "Olivia", language: "en", gender: "female", ageCategory: "young",
    personality: "British accent, elegant and warm",
    description: "UK Accent",
    emoji: "👩", color: "#ec4899",
    previewText: "Hello. I'm Olivia, your AI voice. I'm excited to bring your story to life on Story221.",
    tts: { lang: "en-GB", pitch: 1.15, rate: 0.98, voiceGender: "female" },
  },
  {
    id: "en_kofi", name: "Kofi", language: "en", gender: "male", ageCategory: "mature",
    personality: "African English, warm and resonant",
    description: "Africa Accent",
    emoji: "👨‍🦱", color: "#22c55e",
    previewText: "Hello. I'm Kofi, your AI voice. I'm excited to bring your story to life on Story221.",
    tts: { lang: "en-GB", pitch: 0.85, rate: 0.98, voiceGender: "male" },
  },
  {
    id: "en_david", name: "David", language: "en", gender: "male", ageCategory: "mature",
    personality: "Documentary narrator, deep and authoritative",
    description: "Narrator",
    emoji: "🎙️", color: "#8b5cf6",
    previewText: "Hello. I'm David, your AI voice. I'm excited to bring your story to life on Story221.",
    tts: { lang: "en-US", pitch: 0.78, rate: 0.9, voiceGender: "male" },
  },
  {
    id: "en_sarah", name: "Sarah", language: "en", gender: "female", ageCategory: "young",
    personality: "Commercial voice, upbeat and persuasive",
    description: "Commercial",
    emoji: "📢", color: "#f97316",
    previewText: "Hello. I'm Sarah, your AI voice. I'm excited to bring your story to life on Story221.",
    tts: { lang: "en-US", pitch: 1.2, rate: 1.1, voiceGender: "female" },
  },
  {
    id: "en_michael", name: "Michael", language: "en", gender: "male", ageCategory: "mature",
    personality: "Cinematic voice, intense and dramatic",
    description: "Cinematic",
    emoji: "🎬", color: "#ef4444",
    previewText: "Hello. I'm Michael, your AI voice. I'm excited to bring your story to life on Story221.",
    tts: { lang: "en-US", pitch: 0.8, rate: 0.93, voiceGender: "male" },
  },

  // ─── ARABIC ───
  {
    id: "ar_nour", name: "نور", language: "ar", gender: "male", ageCategory: "young",
    personality: "صوت رجل شاب، دافئ وواضح",
    description: "Homme",
    emoji: "👨", color: "#3b82f6",
    previewText: "مرحباً، أنا نور، صوتك بالذكاء الاصطناعي في Story221. يسعدني أن أرافقك في إنشاء قصتك.",
    tts: { lang: "ar-SA", pitch: 0.9, rate: 0.95, voiceGender: "male" },
  },
  {
    id: "ar_layla", name: "ليلى", language: "ar", gender: "female", ageCategory: "young",
    personality: "صوت أنثوي ناعم ومعبر",
    description: "Femme",
    emoji: "👩", color: "#ec4899",
    previewText: "مرحباً، أنا ليلى، صوتك بالذكاء الاصطناعي في Story221. يسعدني أن أرافقك في إنشاء قصتك.",
    tts: { lang: "ar-SA", pitch: 1.15, rate: 0.98, voiceGender: "female" },
  },
  {
    id: "ar_karim", name: "كريم", language: "ar", gender: "male", ageCategory: "mature",
    personality: "راوي وثائقي، صوت عميق وهادئ",
    description: "Narrateur",
    emoji: "🎙️", color: "#8b5cf6",
    previewText: "مرحباً، أنا كريم، صوتك بالذكاء الاصطناعي في Story221. يسعدني أن أرافقك في إنشاء قصتك.",
    tts: { lang: "ar-SA", pitch: 0.78, rate: 0.88, voiceGender: "male" },
  },
  {
    id: "ar_yasmine", name: "ياسمين", language: "ar", gender: "female", ageCategory: "young",
    personality: "صوت إعلاني، حيوي وجذاب",
    description: "Publicité",
    emoji: "📢", color: "#f97316",
    previewText: "مرحباً، أنا ياسمين، صوتك بالذكاء الاصطناعي في Story221. يسعدني أن أرافقك في إنشاء قصتك.",
    tts: { lang: "ar-SA", pitch: 1.2, rate: 1.08, voiceGender: "female" },
  },
];

/**
 * Find the best matching browser voice for a catalog voice.
 * Tries to match language + gender from available SpeechSynthesis voices,
 * then falls back to cycling through available voices for variety.
 */
export function findBrowserVoice(voices, catalogVoice, indexInGroup = 0) {
  if (!voices || voices.length === 0) return null;
  const { lang, voiceGender } = catalogVoice.tts;
  const langPrefix = lang.split("-")[0];

  // Get all browser voices for this language
  const langVoices = voices.filter((v) => v.lang.startsWith(langPrefix));
  if (langVoices.length === 0) {
    // No language match — try any voice as last resort
    return voices[indexInGroup % voices.length] || null;
  }

  // 1. Try to match gender by known voice names
  const nameList = voiceGender === "male" ? MALE_VOICE_NAMES : FEMALE_VOICE_NAMES;
  const oppositeList = voiceGender === "male" ? FEMALE_VOICE_NAMES : MALE_VOICE_NAMES;

  const genderMatch = langVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return nameList.some((n) => nameLower.includes(n)) &&
           !oppositeList.some((n) => nameLower.includes(n));
  });
  if (genderMatch) return genderMatch;

  // 2. No gender match by name — cycle through available voices by index
  // This ensures different catalog voices use different browser voices when available
  return langVoices[indexInGroup % langVoices.length];
}

/**
 * Play a voice preview using the browser's SpeechSynthesis API.
 * Returns the utterance, or null if unavailable.
 */
export function speakPreview(catalogVoice, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  window.speechSynthesis.cancel();

  // Compute index within language group for voice distribution
  const sameLangVoices = voiceCatalog.filter((v) => v.language === catalogVoice.language);
  const indexInGroup = sameLangVoices.findIndex((v) => v.id === catalogVoice.id);

  const utterance = new SpeechSynthesisUtterance(catalogVoice.previewText);
  utterance.lang = catalogVoice.tts.lang;
  utterance.pitch = catalogVoice.tts.pitch;
  utterance.rate = catalogVoice.tts.rate;

  const voices = window.speechSynthesis.getVoices();
  const match = findBrowserVoice(voices, catalogVoice, indexInGroup);
  if (match) utterance.voice = match;

  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopPreview() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function getVoicesByLanguage(langId) {
  return voiceCatalog.filter((v) => v.language === langId);
}