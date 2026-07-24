// Place Verifier - Module de recherche et vérification visuelle des lieux réels
// Détecte les lieux réels mentionnés dans un prompt et injecte leurs caractéristiques
// visuelles vérifiées (depuis l'entité PlaceReference) dans le contexte de génération.
//
// Les fiches PlaceReference sont gérées et vérifiées depuis le SuperAdmin.
// Chaque fiche ne devient active qu'après vérification visuelle contre des références réelles.

export interface PlaceMatch {
  name: string;
  category: string;
  visual_description: string;
  location: string;
  keywords_matched: string[];
}

export interface PlaceVerificationResult {
  matched_places: PlaceMatch[];
  enriched_context: string;
  has_matches: boolean;
}

// Normalise un texte pour la détection (minuscules, sans accents)
function normalize(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Détecte les lieux connus mentionnés dans le prompt
export async function verifyPlacesInPrompt(base44: any, prompt: string): Promise<PlaceVerificationResult> {
  if (!prompt || !prompt.trim()) {
    return { matched_places: [], enriched_context: "", has_matches: false };
  }

  let places: any[] = [];
  try {
    places = await base44.asServiceRole.entities.PlaceReference.filter({ active: true });
  } catch {
    // Entity might not exist yet — fail gracefully
    return { matched_places: [], enriched_context: "", has_matches: false };
  }

  if (!places || places.length === 0) {
    return { matched_places: [], enriched_context: "", has_matches: false };
  }

  const normalizedPrompt = normalize(prompt);
  const matched: PlaceMatch[] = [];

  for (const place of places) {
    if (!place.keywords || !Array.isArray(place.keywords) || place.keywords.length === 0) continue;

    const matchedKeywords: string[] = [];
    for (const kw of place.keywords) {
      const nkw = normalize(kw);
      if (nkw && normalizedPrompt.includes(nkw)) {
        matchedKeywords.push(kw);
      }
    }

    if (matchedKeywords.length > 0) {
      matched.push({
        name: place.name,
        category: place.category,
        visual_description: place.visual_description,
        location: place.location || "",
        keywords_matched: matchedKeywords,
      });
    }
  }

  if (matched.length === 0) {
    return { matched_places: [], enriched_context: "", has_matches: false };
  }

  // Build the enriched context block to inject into the creative direction prompt
  let context = "## LIEUX RÉELS DÉTECTÉS — CARACTÉRISTIQUES VISUELLES VÉRIFIÉES\n";
  context += "Les lieux suivants ont été mentionnés dans le prompt. Leurs caractéristiques visuelles ont été VÉRIFIÉES contre des références réelles. Tu DOIS les respecter fidèlement dans chaque scène — pas d'interprétation vague ou générique.\n\n";

  for (const place of matched) {
    context += `### ${place.name}\n`;
    context += `- Catégorie: ${place.category}\n`;
    if (place.location) context += `- Localisation: ${place.location}\n`;
    context += `- Mots-clés détectés: ${place.keywords_matched.join(", ")}\n`;
    context += `- Caractéristiques visuelles vérifiées:\n${place.visual_description}\n\n`;
  }

  context += "⚠️ RÈGLE DE FIDÉLITÉ: chaque rendu de ces lieux doit être RECONNAISSABLE et fidèle à la réalité. Utilise les caractéristiques ci-dessus comme base visuelle authoritative dans les engine_prompts et descriptions de scènes.\n";

  return {
    matched_places: matched,
    enriched_context: context,
    has_matches: true,
  };
}

// Analyse une image de référence uploadée et extrait sa description visuelle
// pour verrouillage d'identité (personne, produit, personnage)
export async function analyzeUserReference(base44: any, imageUrl: string, type: string): Promise<string> {
  if (!imageUrl) return "";

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyse cette image de référence avec une précision EXTRÊME. Type: ${type}.

EXTRAIT et décris en détail:
- ${type === "person" ? "Visage: forme, couleur de peau, coiffure, yeux, nez, bouche, barbe/moustache, traits distinctifs" : "Apparence: forme, texture, couleurs"}
- ${type === "person" ? "Morphologie: taille, corpulence, proportions" : "Dimensions et proportions"}
- Vêtements/habillage (si visible): couleurs, style, motifs
- Couleurs dominantes
- Accessoires ou éléments distinctifs
- Propotions et caractéristiques qui font l'identité unique de cette référence

Cette description servira de VERROU D'IDENTITÉ: le moteur de génération devra conserver EXACTEMENT ces caractéristiques dans toutes les scènes, sans jamais les modifier, embellir ou réinterpréter.

Réponds avec une description visuelle structurée et précise.`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: "object",
        properties: {
          visual_description: { type: "string" },
          identity_key_features: { type: "string" },
          colors_dominant: { type: "string" },
          distinctive_traits: { type: "string" },
        },
        required: ["visual_description"],
      },
    });

    const parts = [
      result.visual_description,
      result.identity_key_features ? `Traits d'identité clés: ${result.identity_key_features}` : "",
      result.colors_dominant ? `Couleurs dominantes: ${result.colors_dominant}` : "",
      result.distinctive_traits ? `Traits distinctifs: ${result.distinctive_traits}` : "",
    ].filter(Boolean);

    return parts.join("\n");
  } catch (e) {
    console.error("analyzeUserReference failed:", e.message);
    return "";
  }
}