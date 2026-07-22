export const countryPrefixes = [
  { prefix: "+221", country: "Sénégal", flag: "🇸🇳" },
  { prefix: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { prefix: "+223", country: "Mali", flag: "🇲🇱" },
  { prefix: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { prefix: "+224", country: "Guinée", flag: "🇬🇳" },
  { prefix: "+229", country: "Bénin", flag: "🇧🇯" },
  { prefix: "+228", country: "Togo", flag: "🇹🇬" },
  { prefix: "+227", country: "Niger", flag: "🇳🇪" },
  { prefix: "+237", country: "Cameroun", flag: "🇨🇲" },
  { prefix: "+242", country: "Congo", flag: "🇨🇬" },
  { prefix: "+243", country: "RD Congo", flag: "🇨🇩" },
  { prefix: "+233", country: "Ghana", flag: "🇬🇭" },
  { prefix: "+234", country: "Nigeria", flag: "🇳🇬" },
  { prefix: "+212", country: "Maroc", flag: "🇲🇦" },
  { prefix: "+213", country: "Algérie", flag: "🇩🇿" },
  { prefix: "+216", country: "Tunisie", flag: "🇹🇳" },
  { prefix: "+218", country: "Libye", flag: "🇱🇾" },
  { prefix: "+20", country: "Égypte", flag: "🇪🇬" },
  { prefix: "+254", country: "Kenya", flag: "🇰🇪" },
  { prefix: "+255", country: "Tanzanie", flag: "🇹🇿" },
  { prefix: "+33", country: "France", flag: "🇫🇷" },
  { prefix: "+32", country: "Belgique", flag: "🇧🇪" },
  { prefix: "+41", country: "Suisse", flag: "🇨🇭" },
  { prefix: "+44", country: "Royaume-Uni", flag: "🇬🇧" },
  { prefix: "+49", country: "Allemagne", flag: "🇩🇪" },
  { prefix: "+39", country: "Italie", flag: "🇮🇹" },
  { prefix: "+34", country: "Espagne", flag: "🇪🇸" },
  { prefix: "+351", country: "Portugal", flag: "🇵🇹" },
  { prefix: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { prefix: "+7", country: "Russie", flag: "🇷🇺" },
  { prefix: "+86", country: "Chine", flag: "🇨🇳" },
  { prefix: "+81", country: "Japon", flag: "🇯🇵" },
  { prefix: "+82", country: "Corée du Sud", flag: "🇰🇷" },
  { prefix: "+91", country: "Inde", flag: "🇮🇳" },
  { prefix: "+55", country: "Brésil", flag: "🇧🇷" },
];

export function detectCountryFromPhone(phone) {
  const normalized = phone.trim();
  if (!normalized) return null;
  const withPlus = normalized.startsWith("+") ? normalized : "+" + normalized;
  const sorted = [...countryPrefixes].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const c of sorted) {
    if (withPlus.startsWith(c.prefix)) return c;
  }
  return null;
}

export function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^\+\d{6,15}$/.test(cleaned);
}