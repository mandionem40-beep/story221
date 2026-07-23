import { base44 } from "@/api/base44Client";

/**
 * Load all SiteContent settings as a key-value map.
 */
export async function loadSettings(category) {
  try {
    const items = await base44.entities.SiteContent.filter(
      category ? { category } : {}
    );
    const map = {};
    (items || []).forEach((item) => {
      map[item.key] = item;
    });
    return map;
  } catch {
    return {};
  }
}

/**
 * Save (upsert) a setting. Creates if new, updates if exists.
 */
export async function saveSetting(key, value, category = "general") {
  const existing = await base44.entities.SiteContent.filter({ key });
  if (existing && existing.length > 0) {
    return await base44.entities.SiteContent.update(existing[0].id, { value });
  }
  return await base44.entities.SiteContent.create({ key, value, category });
}

/**
 * Default AI provider configurations.
 */
export const AI_PROVIDERS = [
  { id: "claude", name: "Claude (Anthropic)", models: "Claude Sonnet 4, Opus 4", role: "Directeur IA & Orchestration", secretKey: "Anthropic" },
  { id: "gemini", name: "Gemini (Google)", models: "Gemini 2.5 Pro, 3 Flash", role: "Recherche web & Vision", secretKey: "gemini-2.5-pro" },
  { id: "veo", name: "Veo (Google)", models: "Veo 3.x", role: "Génération vidéo", secretKey: null },
  { id: "imagen", name: "Imagen (Google)", models: "Imagen 3", role: "Génération d'images", secretKey: null },
  { id: "elevenlabs", name: "ElevenLabs", models: "Whisper, TTS", role: "Transcription & Voix", secretKey: null },
  { id: "paydunya", name: "PayDunya", models: "API Paiements", role: "Paiements Mobile Money", secretKey: "PAYDUNYA_TOKEN" },
];

/**
 * Default CMS page slugs.
 */
export const CMS_PAGES = [
  { key: "cms_terms", label: "Conditions d'utilisation" },
  { key: "cms_privacy", label: "Politique de confidentialité" },
  { key: "cms_about", label: "À propos" },
  { key: "cms_contact", label: "Contact" },
];

/**
 * Default general settings keys.
 */
export const GENERAL_SETTINGS = [
  { key: "site_name", label: "Nom du site", default: "Story221" },
  { key: "site_description", label: "Description", default: "Studio IA Social" },
  { key: "site_email", label: "Email contact", default: "contact@story221.com" },
  { key: "site_phone", label: "Téléphone", default: "" },
  { key: "site_address", label: "Adresse", default: "Dakar, Sénégal" },
  { key: "site_timezone", label: "Fuseau horaire", default: "Africa/Dakar" },
  { key: "site_currency", label: "Devise", default: "FCFA" },
  { key: "site_logo_url", label: "URL du logo", default: "" },
  { key: "site_favicon_url", label: "URL du favicon", default: "" },
];

/**
 * Default SEO settings keys.
 */
export const SEO_SETTINGS = [
  { key: "seo_meta_title", label: "Meta Title", default: "Story221 — Studio IA Social" },
  { key: "seo_meta_description", label: "Meta Description", default: "Créez des vidéos, films et pubs avec l'IA. Rejoignez la communauté Story221." },
  { key: "seo_keywords", label: "Keywords", default: "IA, vidéo, studio, Sénégal, création" },
  { key: "seo_og_title", label: "Open Graph Title", default: "Story221" },
  { key: "seo_og_description", label: "Open Graph Description", default: "Studio IA Social" },
  { key: "seo_og_image_url", label: "Open Graph Image URL", default: "" },
  { key: "seo_robots", label: "Robots", default: "index, follow" },
];

/**
 * Default AI config settings.
 */
export const AI_CONFIG_SETTINGS = [
  { key: "ai_max_video_duration", label: "Durée max des vidéos (minutes)", default: "10" },
  { key: "ai_max_images", label: "Nombre max d'images de référence", default: "10" },
  { key: "ai_max_script_length", label: "Longueur max des scénarios (caractères)", default: "5000" },
  { key: "ai_video_resolution", label: "Résolution vidéo", default: "1080p" },
  { key: "ai_video_quality", label: "Qualité vidéo", default: "high" },
  { key: "ai_free_trial_credits", label: "Crédits essai gratuit", default: "50" },
  { key: "ai_referral_reward", label: "Récompense parrainage (diamants)", default: "5" },
];