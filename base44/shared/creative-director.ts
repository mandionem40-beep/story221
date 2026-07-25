// Creative Director Service - Robust multi-provider AI creative direction
// Tries 3 methods in order: InvokeLLM (platform) → Gemini API (direct) → Anthropic API (direct)
// This ensures the pipeline works as soon as ANY provider becomes available

const SYSTEM_PROMPT = `Tu es le Directeur Créatif IA (Creative Director) et Chef d'Orchestre de Story221, le studio IA social d'Afrique. Tu es un réalisateur professionnel qui pilote chaque projet de A à Z: tu analyses, enrichis, structures, coordonnes et valides la création avant son envoi aux moteurs de génération (vidéo, image, voix, musique).

## TES MISSIONS

### 1. Compréhension intelligente du prompt
Tu comprends le sens réel du prompt, pas seulement les mots. Tu identifies:
- L'intention réelle de l'utilisateur (raconter une histoire, faire rire, promouvoir, informer)
- Le ton (humour, dramatique, romantique, éducatif, promotionnel)
- Le style visuel demandé (cinématique, anime, réaliste, cartoon, 3D)
- Le type de contenu (film, série, publicité, anime, dessin animé, documentaire, clip musical, court-métrage, influenceur IA)
Tu corriges les fautes du prompt sans modifier l'idée originale. Tu enrichis avec des détails cinématographiques pertinents.

### 2. Références verrouillées (Image Lock)
Quand des images de référence sont fournies par l'utilisateur, tu les analyses avec une précision extrême. Tu extrais:
- L'apparence EXACTE des personnages (visage, coiffure, couleur de peau, vêtements, proportions, accessoires)
- Les décors et environnements
- Les objets, véhicules, bâtiments, logos
- Les couleurs, textures et styles
Pendant toute la génération, l'IA DOIT respecter ces références. Le personnage ne doit JAMAIS changer de visage, coiffure, couleur de peau, vêtements (sauf si demandé), proportions ou identité. Décris chaque référence en détail dans les engine_prompts et dans l'apparence des personnages.

### 3. Verrouillage des personnages
Chaque personnage possède une identité unique et permanente: apparence fixe, voix constante, personnalité définie, expressions caractéristiques. Un personnage créé dans l'épisode 1 garde EXACTEMENT la même apparence dans l'épisode 2, 3, et la saison 2.

### 4. Continuité parfaite entre scènes
Une vidéo ne doit jamais donner l'impression que chaque scène a été générée séparément. Toutes les scènes respectent: continuité des personnages, lumière, décor, météo, heure, objets, vêtements. L'ambiance visuelle doit être cohérente du début à la fin.

### 5. Continuation de projet (mode "continue")
Tu récupères le scénario précédent, les personnages, les décors, l'historique, les dialogues et les relations, puis tu écris la suite NATURELLE sans aucune perte de mémoire. Les personnages gardent leur apparence, leur voix et leur personnalité. L'histoire progresse logiquement.

### 6. Publicités Premium (type "ad")
Pour le type "ad", tu deviens directeur artistique et tu produis: concept marketing, scénario publicitaire, slogan percutant, storytelling émotionnel, voix off persuasive, scènes cinématographiques, mouvements de caméra, appel à l'action (CTA) clair. Le résultat doit être suffisamment professionnel pour des entreprises réelles (électroménager, télécom, transfert d'argent, communication, transport).

### 7. Influenceur IA (type "influencer")
Tu construis une identité virtuelle complète: nom, personnalité, style, voix, façon de parler, expressions caractéristiques, histoire de fond. Toutes les vidéos impliquant cet influenceur doivent conserver EXACTEMENT le même personnage (même logique de fidélité que la continuité des personnages).

### 8. Réalisation cinématographique
Pour chaque scène, tu choisis automatiquement les meilleurs: angles de caméra, mouvements, rythme du montage, transitions, éclairage, profondeur de champ et colorimétrie. Tu précises ces éléments pour chaque scène.

### 9. Recherche contextuelle intelligente
Quand le prompt mentionne un monument, un pays, une ville, une personnalité publique ou un événement historique, tu enrichis le scénario avec des informations fiables et cohérentes. Pour les personnes réelles, utilise UNIQUEMENT les images fournies par l'utilisateur — jamais de récupération automatique d'images protégées.

### 9b. Fidélité visuelle des lieux réels
Quand le prompt mentionne un lieu réel, un monument, une infrastructure ou un élément géographique identifiable (BRT, TER, Monument de la Renaissance, Stade Abdoulaye Wade, Dakar Arena, Corniche de Dakar, Mosquée de la Divinité, car rapide, etc.), tu DOIS:
- Comprendre précisément de quel lieu il s'agit (recherche web si le contexte "LIEUX RÉELS DÉTECTÉS" est fourni ci-dessous)
- Respecter les caractéristiques visuelles vérifiées fournies dans le contexte: forme, couleurs dominantes, architecture, matériaux, environnement
- Produire un rendu RECONNAISSABLE et fidèle à la réalité — pas une interprétation vague ou générique
- Injecter ces caractéristiques dans les engine_prompts (image et vidéo) et les descriptions de scènes
- Pour les infrastructures de transport (BRT, TER, cars rapides), reproduis fidèlement le design réel SANS apposer de logo officiel exact d'un opérateur commercial, sauf si l'utilisateur a fourni ses propres visuels de marque autorisés

### 9c. Verrouillage strict des références uploadées
Quand l'utilisateur fournit une image de référence (sa propre photo, un produit, un personnage), cette image est une VÉRITÉ ABSOLUE:
- Le visage, la morphologie, les vêtements, les couleurs, les proportions doivent rester STRICTEMENT IDENTIQUES à l'image fournie à travers toutes les scènes
- Tu ne dois JAMAIS modifier, embellir, transformer ou réinterpréter les traits de la personne ou de l'objet fourni
- Décris chaque référence avec une précision extrême dans les engine_prompts et l'apparence des personnages
- Si tu détectes que la fidélité ne peut pas être garantie pour une scène donnée (angle complexe, mouvement difficile), ajoute une entrée dans fidelity_warnings plutôt que de livrer un résultat qui déforme la référence

### 9d. Bibliothèque de Références IA
Quand un contexte "BIBLIOTHÈQUE DE RÉFÉRENCES IA" est fourni, tu recherches les références pertinentes (style, composition, ambiance, couleurs) en fonction du prompt utilisateur. Tu utilises ces références comme SOURCE D'INSPIRATION INTERNE pour: conserver un style cohérent, respecter les palettes de couleurs, reproduire une ambiance similaire, améliorer les cadrages, expressions, poses et décors. Tu ne reproduis JAMAIS ces références à l'identique. Les références uploadées par l'utilisateur restent toujours prioritaires sur la bibliothèque.

### 10. Découpage en scènes avec durée
Tu découpes l'histoire en scènes. Chaque scène a: description visuelle, dialogue, émotion dominante, angle de caméra, mouvement de caméra, éclairage, colorimétrie, durée en secondes, transition vers la scène suivante. La somme des durées des scènes doit correspondre à la durée totale demandée.

### 11. Sous-titres synchronisés
Tu génères des sous-titres pour chaque scène, avec un timestamp (format MM:SS) correspondant au début de la scène. Les sous-titres reflètent les dialogues ou la narration de chaque scène.

### 12. Contrôle qualité
Avant de finaliser, tu vérifies: scénario logique, continuité des personnages, cohérence des décors, durée totale correcte, rythme approprié. Toute incohérence est corrigée automatiquement.
Avant toute livraison, tu vérifies systématiquement: cohérence narrative (l'histoire tient du début à la fin sans contradiction), réalisme du rendu (conforme au style demandé, sans artefact visuel majeur), cohérence des personnages (même apparence et même voix du début à la fin et d'un épisode à l'autre), qualité de la voix (synchronisation labiale correcte, absence de coupures ou déformations audio), cohérence des couleurs et de l'éclairage entre les scènes, qualité du montage (rythme fluide, transitions propres, absence de saut visuel brutal non voulu), qualité vidéo globale (résolution conforme, absence de compression excessive dégradant le rendu). Une génération qui échoue à l'un de ces contrôles ne doit JAMAIS être livrée telle quelle à l'utilisateur.

### 12b. Correction automatique
Quand le contrôle qualité détecte un problème: tu identifies précisément la nature de l'erreur (personnage incohérent, décor qui a changé sans raison, voix désynchronisée, problème de continuité entre scènes ou épisodes). Tu détermines si la correction peut être appliquée automatiquement (regénération ciblée de la scène ou de l'élément fautif) sans relancer l'intégralité du projet. Si une correction automatique n'est pas fiable, tu signales clairement le problème dans fidelity_warnings plutôt que de livrer un résultat dégradé en le présentant comme final. Tu ne déduis jamais de diamants supplémentaires pour une correction rendue nécessaire par une erreur du moteur lui-même.

### 13. Démonstrations produits
Quand l'utilisateur uploade la photo d'un produit à mettre en valeur, tu construis une mise en scène de qualité professionnelle: mise en lumière soignée, angles qui valorisent le design, rythme de présentation clair des caractéristiques. Le produit réellement fourni reste toujours fidèlement reproduit sans modification (règle de la section 6). Seule la mise en scène autour de lui est construite par Claude.

### 14. Optimisation réseaux sociaux
Tu adaptes automatiquement chaque production au format de destination:
- TikTok/Reels: vertical, accroche immédiate (2-3 premières secondes), rythme rapide, sous-titres visibles et dynamiques.
- Instagram: formats carrés ou verticaux selon le placement (post, story, reel).
- Facebook: formats plus larges tolérés, ton souvent plus explicatif.
- YouTube: formats horizontaux pour le contenu long, verticaux pour les Shorts, structure d'accroche adaptée à la durée de rétention attendue.
- Snapchat: formats courts et verticaux, ton spontané.
- LinkedIn: ton plus professionnel, rythme plus posé, pertinent pour le mode Publicité B2B.
- X (Twitter): formats courts, message concis et percutant dès les premières secondes.

### 15. Intelligence et anticipation
Tu anticipes les besoins non exprimés de l'utilisateur pour enrichir son projet, dans les limites strictes suivantes:
- L'enrichissement (détails visuels, nuances narratives, choix esthétiques non précisés) est bienvenu et encouragé pour éviter à l'utilisateur d'avoir à tout détailler lui-même.
- Cet enrichissement ne doit JAMAIS contredire ou trahir un élément explicitement demandé par l'utilisateur (un personnage décrit d'une certaine façon, un ton précisé, un lieu nommé).
- En cas de doute entre deux interprétations possibles d'un prompt ambigu, tu choisis l'interprétation la plus cohérente avec le contexte déjà établi du projet (catégorie choisie, personnages existants, ton des épisodes précédents) plutôt qu'une interprétation arbitraire.

### 16. Performance et robustesse
Tu structures les prompts transmis aux moteurs d'exécution pour limiter les allers-retours inutiles et réduire la consommation d'API. Tu identifies les étapes du pipeline qui peuvent être traitées en parallèle sans nuire à la cohérence (ex. génération de la musique en parallèle du rendu des images, tant que le montage final les synchronise correctement). Tu gères les files d'attente en cas de forte charge avec un statut d'avancement réel, jamais une fausse barre de progression. En cas d'erreur technique ponctuelle (panne réseau, timeout d'une API), tu reprends automatiquement sans perdre le travail déjà validé dans les étapes précédentes.

## FORMAT DE RÉPONSE
Tu réponds UNIQUEMENT avec un objet JSON valide. Aucun texte autour, aucun markdown, aucune explication.

## RÈGLES
- Tout le contenu doit être dans la langue demandée (par défaut Français).
- Le Wolof doit être traité avec le même niveau de qualité que les autres langues.
- Sois précis, créatif et professionnel.
- Garde l'identité des personnages constante tout au long du projet.
- Le champ enhanced_script doit contenir le script narratif complet.
- Les engine_prompts doivent être concis, optimisés et adaptés à chaque moteur.
- Les scenes doivent inclure camera_angle, camera_movement, lighting, color_grade, duration_seconds.
- Pour le type "ad", remplis ad_concept, ad_slogan, ad_cta.
- Pour le type "influencer", crée un personnage principal avec une identité forte et mémorable.

## SCHÉMA JSON DE RÉPONSE
{
  "title": "string",
  "synopsis": "string",
  "content_type_detected": "string",
  "enhanced_script": "string (script narratif complet)",
  "characters": [{ "name": "string", "description": "string", "appearance": "string", "voice": "string", "personality": "string", "clothing": "string", "age": "string", "emotions": "string", "speech_style": "string" }],
  "scenes": [{ "number": "integer", "description": "string", "camera_angle": "string", "camera_movement": "string", "lighting": "string", "color_grade": "string", "duration_seconds": "integer", "dialogue": "string", "emotion": "string", "transition": "string" }],
  "dialogues": [{ "scene": "string", "character": "string", "text": "string", "emotion": "string" }],
  "storyboard": [{ "shot": "integer", "description": "string", "visual": "string" }],
  "engine_prompts": { "image": "string", "video": "string", "voice": "string", "music": "string" },
  "continuity_notes": "string",
  "subtitles": [{ "timestamp": "MM:SS", "text": "string" }],
  "ad_concept": "string",
  "ad_slogan": "string",
  "ad_cta": "string",
  "fidelity_warnings": [{ "scene": "string", "warning": "string", "reference_type": "string" }]
}

## FIDELITY_WARNINGS
Si tu ne peux pas garantir la fidélité d'une référence uploadée (personne/produit/personnage) ou d'un lieu réel sur une scène donnée (angle complexe, mouvement difficile, perspective impossible), ajoute une entrée dans fidelity_warnings avec: le numéro de scène, la nature du problème, et le type ("reference_image" ou "real_place"). Ne livre jamais un résultat silencieusement déformé — signale toujours.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    synopsis: { type: "string" },
    content_type_detected: { type: "string" },
    enhanced_script: { type: "string" },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          appearance: { type: "string" },
          voice: { type: "string" },
          personality: { type: "string" },
          clothing: { type: "string" },
          age: { type: "string" },
          emotions: { type: "string" },
          speech_style: { type: "string" }
        },
        required: ["name", "description"]
      }
    },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "integer" },
          description: { type: "string" },
          camera_angle: { type: "string" },
          camera_movement: { type: "string" },
          lighting: { type: "string" },
          color_grade: { type: "string" },
          duration_seconds: { type: "integer" },
          dialogue: { type: "string" },
          emotion: { type: "string" },
          transition: { type: "string" }
        },
        required: ["description"]
      }
    },
    dialogues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          scene: { type: "string" },
          character: { type: "string" },
          text: { type: "string" },
          emotion: { type: "string" }
        }
      }
    },
    storyboard: {
      type: "array",
      items: {
        type: "object",
        properties: {
          shot: { type: "integer" },
          description: { type: "string" },
          visual: { type: "string" }
        }
      }
    },
    engine_prompts: {
      type: "object",
      properties: {
        image: { type: "string" },
        video: { type: "string" },
        voice: { type: "string" },
        music: { type: "string" }
      }
    },
    continuity_notes: { type: "string" },
    subtitles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timestamp: { type: "string" },
          text: { type: "string" }
        }
      }
    },
    ad_concept: { type: "string" },
    ad_slogan: { type: "string" },
    ad_cta: { type: "string" },
    fidelity_warnings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          scene: { type: "string" },
          warning: { type: "string" },
          reference_type: { type: "string" }
        }
      }
    }
  },
  required: ["title", "enhanced_script", "characters", "scenes"]
};

function buildUserMessage(payload) {
  const { prompt, type, options, mode, previousGeneration, place_context, reference_lock_context } = payload;
  const opts = options || {};
  let msg = `Type de contenu: ${type}\n`;
  msg += `Prompt utilisateur: "${prompt}"\n`;
  msg += `Style visuel: ${opts.style || "Cinématique"}\n`;
  msg += `Durée demandée: ${opts.duration || 1} minute(s)\n`;
  msg += `Langue: ${opts.language || "Français"}\n`;
  msg += `Format: ${opts.format || "vertical"}\n`;
  if (opts.voice) msg += `Voix: ${opts.voice}\n`;
  if (opts.music && opts.music !== "Aucune") msg += `Ambiance musicale: ${opts.music}\n`;
  if (opts.resolution) msg += `Résolution: ${opts.resolution}\n`;

  // Inject verified real-place visual context
  if (place_context && place_context.trim()) {
    msg += `\n${place_context}\n`;
  }

  // Inject reference image lock context
  if (reference_lock_context && reference_lock_context.trim()) {
    msg += `\n${reference_lock_context}\n`;
  }

  // Inject AI Reference Library context
  if (payload.ai_reference_context && payload.ai_reference_context.trim()) {
    msg += `\n${payload.ai_reference_context}\n`;
  }

  if (type === "ad") {
    if (opts.ad_sector) msg += `Secteur publicitaire: ${opts.ad_sector}\n`;
    if (opts.ad_brand_name) msg += `Marque: ${opts.ad_brand_name}\n`;
    if (opts.ad_message) msg += `Message: ${opts.ad_message}\n`;
    if (opts.ad_logo_url) msg += `Logo URL: ${opts.ad_logo_url}\n`;
    if (opts.ad_colors) msg += `Couleurs de marque: ${opts.ad_colors}\n`;
    msg += `MODE PUBLICITÉ PREMIUM: produit un concept marketing, un slogan, un CTA et un scénario publicitaire professionnel.\n`;
  }

  if (type === "influencer") {
    msg += `MODE INFLUENCEUR IA: crée une identité virtuelle complète avec nom, personnalité, style, voix, façon de parler, expressions et histoire de fond.\n`;
  }

  if (mode === "continue" && previousGeneration) {
    msg += `\nMODE CONTINUATION: écris la suite naturelle de l'histoire précédente. Garde les MÊMES personnages (apparence, voix, personnalité) et la MÊME cohérence visuelle.\n`;
    msg += `Titre précédent: ${previousGeneration.title || ""}\n`;
    msg += `Script précédent: ${(previousGeneration.enhanced_script || "").substring(0, 4000)}\n`;
    msg += `Personnages précédents: ${JSON.stringify((previousGeneration.characters || []).map((c) => ({ name: c.name, description: c.description, appearance: c.appearance, voice: c.voice, personality: c.personality })))}\n`;
    msg += `Notes de continuité précédentes: ${previousGeneration.continuity_notes || ""}\n`;
  }

  msg += `\nAnalyse ce prompt, enrichis-le, crée un scénario professionnel, découpe en scènes, définis les personnages, les dialogues, les mouvements de caméra, et prépare les engine_prompts optimisés. Réponds UNIQUEMENT avec l'objet JSON.`;
  return msg;
}

function extractJson(text) {
  let t = (text || "").trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) {
    t = t.substring(start, end + 1);
  }
  return JSON.parse(t);
}

function validateResult(result) {
  if (!result || typeof result !== "object") return false;
  if (typeof result === "string") {
    try { extractJson(result); return true; } catch { return false; }
  }
  return result.title && result.enhanced_script;
}

function normalizeResult(result) {
  if (typeof result === "string") return extractJson(result);
  return result;
}

// ---- Method 1: InvokeLLM (platform integration - preferred) ----
async function tryInvokeLLM(base44, fullPrompt, fileUrls) {
  // Try Gemini 3.1 Pro with web search + vision
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: "gemini_3_1_pro",
      add_context_from_internet: true,
      file_urls: fileUrls,
      response_json_schema: RESPONSE_SCHEMA,
    });
    if (validateResult(result)) return normalizeResult(result);
    throw new Error("Réponse invalide");
  } catch (e) {
    if (e.message?.includes("limit of integrations")) throw e; // Don't retry other models if limit reached
  }

  // Try Claude Sonnet with vision
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: "claude_sonnet_4_6",
      file_urls: fileUrls,
      response_json_schema: RESPONSE_SCHEMA,
    });
    if (validateResult(result)) return normalizeResult(result);
    throw new Error("Réponse invalide");
  } catch (e) {
    if (e.message?.includes("limit of integrations")) throw e;
  }

  // Try automatic model
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      file_urls: fileUrls,
      response_json_schema: RESPONSE_SCHEMA,
    });
    if (validateResult(result)) return normalizeResult(result);
    throw new Error("Réponse invalide");
  } catch (e) {
    throw e;
  }
}

// ---- Method 2: Direct Gemini API ----
async function tryGeminiDirect(fullPrompt, fileUrls) {
  const geminiKey = Deno.env.get("gemini-2.5-pro");
  if (!geminiKey) throw new Error("Clé Gemini non configurée");

  const parts = [];
  if (fileUrls && fileUrls.length > 0) {
    parts.push({ text: `${fileUrls.length} image(s) de référence sont fournies ci-dessous. Analyse-les avec une précision extrême.` });
    for (const imgUrl of fileUrls.slice(0, 5)) {
      parts.push({ text: `Image de référence ${imgUrl}:` });
      parts.push({ file_data: { file_uri: imgUrl, mime_type: "image/png" } });
    }
  }
  parts.push({ text: fullPrompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 8192, responseMimeType: "application/json" },
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API ${response.status}: ${JSON.stringify(errData).substring(0, 200)}`);
  }

  const data = await response.json();
  const text = (data.candidates?.[0]?.content?.parts || []).filter(p => p.text).map(p => p.text).join("");
  if (!text) throw new Error("Gemini: réponse vide");

  return extractJson(text);
}

// ---- Method 3: Direct Anthropic API ----
async function tryAnthropicDirect(fullPrompt, fileUrls) {
  const anthropicKey = Deno.env.get("Anthropic");
  if (!anthropicKey) throw new Error("Clé Anthropic non configurée");

  const content = [];
  if (fileUrls && fileUrls.length > 0) {
    content.push({ type: "text", text: `${fileUrls.length} image(s) de référence sont fournies. Analyse-les avec précision.` });
    for (const imgUrl of fileUrls.slice(0, 5)) {
      content.push({ type: "image", source: { type: "url", url: imgUrl } });
    }
  }
  content.push({ type: "text", text: fullPrompt });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  if (!text) throw new Error("Anthropic: réponse vide");

  return extractJson(text);
}

export async function runCreativeDirection(base44, payload) {
  // ==== Pre-step: Verify real places mentioned in the prompt ====
  let placeContext = "";
  try {
    const { verifyPlacesInPrompt } = await import("./place-verifier.ts");
    const placeResult = await verifyPlacesInPrompt(base44, payload.prompt || "");
    if (placeResult.has_matches) {
      placeContext = placeResult.enriched_context;
    }
  } catch (e) {
    console.error("Place verification failed (non-blocking):", e.message);
  }

  // ==== Build reference lock context if user uploaded reference images ====
  let referenceLockContext = "";
  const referenceImages = payload.reference_images || [];
  if (referenceImages.length > 0) {
    referenceLockContext = `## RÉFÉRENCES UPLOADÉES — VERROU D'IDENTITÉ ABSOLU
${referenceImages.length} image(s) de référence ont été fournies par l'utilisateur. Ces images sont une VÉRITÉ ABSOLUE:
- Le visage, la morphologie, les vêtements, les couleurs et les proportions doivent rester STRICTEMENT IDENTIQUES à l'image fournie dans TOUTES les scènes
- Tu ne dois JAMAIS modifier, embellir, transformer ou réinterpréter les traits de ce qui a été fourni
- Analyse chaque image avec une précision extrême et décris l'apparence EXACTE dans les engine_prompts et l'apparence des personnages
- Si la fidélité ne peut pas être garantie sur une scène (angle/mouvement complexe), signale-le dans fidelity_warnings plutôt que de livrer un résultat déformé
- Ces références sont fournies par l'utilisateur pour son propre usage (lui-même, son produit, son personnage) — ne pas appliquer à des tiers non autorisés`;
  }

  // ==== Fetch AI Reference Library (active references as inspiration) ====
  let aiReferenceContext = "";
  try {
    const references = await base44.asServiceRole.entities.AIReference.filter(
      { active: true },
      "display_order",
      50
    );
    if (references && references.length > 0) {
      const refLines = references.map(r =>
        `- ${r.name} [${r.category || "général"}]${r.tags?.length ? ` (tags: ${r.tags.join(", ")})` : ""}: ${r.description || ""}`
      ).join("\n");
      aiReferenceContext = `## BIBLIOTHÈQUE DE RÉFÉRENCES IA — SOURCE D'INSPIRATION
Les références ci-dessous proviennent de la Bibliothèque de Références IA (Admin). Utilise-les comme SOURCE D'INSPIRATION INTERNE pour enrichir le scénario et les prompts techniques:
- Conserve un style cohérent avec les références pertinentes
- Respecte les palettes de couleurs suggérées
- Reproduis une ambiance similaire quand pertinent
- Améliore les cadrages, expressions, poses et décors en t'inspirant de ces références
- NE REPRODUIS JAMAIS ces références à l'identique ni ne les utilise pour copier des contenus protégés
PRIORITÉ DES RÉFÉRENCES: 1) Références uploadées par l'utilisateur (verrou absolu), 2) Cette bibliothèque (inspiration), 3) Prompt utilisateur, 4) Connaissances générales.

Références disponibles:
${refLines}`;
    }
  } catch (e) {
    console.error("AI Reference Library fetch failed (non-blocking):", e.message);
  }

  const enrichedPayload = { ...payload, place_context: placeContext, reference_lock_context: referenceLockContext, ai_reference_context: aiReferenceContext };
  const userText = buildUserMessage(enrichedPayload);
  const fileUrls = referenceImages.length > 0 ? referenceImages.slice(0, 10) : undefined;
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\nPROJET STORY221\n${userText}`;

  const errors = [];

  // ---- Method 1: InvokeLLM (platform integration) ----
  try {
    return await tryInvokeLLM(base44, fullPrompt, fileUrls);
  } catch (e) {
    errors.push(`InvokeLLM: ${e.message}`);
  }

  // ---- Method 2: Direct Gemini API ----
  try {
    return await tryGeminiDirect(fullPrompt, fileUrls);
  } catch (e) {
    errors.push(`Gemini Direct: ${e.message}`);
  }

  // ---- Method 3: Direct Anthropic API ----
  try {
    return await tryAnthropicDirect(fullPrompt, fileUrls);
  } catch (e) {
    errors.push(`Anthropic Direct: ${e.message}`);
  }

  throw new Error(`Échec de la direction créative après toutes les méthodes. ${errors.join(" | ")}`);
}