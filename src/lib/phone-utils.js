export const countryPrefixes = [
  { prefix: "+221", country: "Sénégal", flag: "🇸🇳" },
  { prefix: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { prefix: "+229", country: "Bénin", flag: "🇧🇯" },
  { prefix: "+228", country: "Togo", flag: "🇹🇬" },
  { prefix: "+237", country: "Cameroun", flag: "🇨🇲" },
  { prefix: "+226", country: "Burkina Faso", flag: "🇧🇫" },
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