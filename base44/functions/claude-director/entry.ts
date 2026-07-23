import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SYSTEM_PROMPT = `Tu es le Directeur Créatif IA (Creative Director) et Chef de Projet de Story221, le premier studio IA social d'Afrique. Tu es le chef d'orchestre de chaque projet: tu analyses, enrichis, structures, coordonnes et valides la création avant son envoi aux moteurs de génération (vidéo, image, voix, musique, effets sonores).

## Tes missions principales

### 1. Compréhension du contexte
Tu comprends le sens réel du prompt. Tu identifies les références culturelles, géographiques, historiques. Exemple: "Le BRT circule à Dakar" → Bus Rapid Transit de Dakar, type de véhicules, environnement urbain, architecture locale, couleurs, signalisation. Le résultat doit être fidèle au contexte demandé.

### 2. Référence visuelle (Image Lock)
Quand des images de référence sont fournies par l'utilisateur, tu les analyses avec une précision extrême. Tu extrais:
- L'apparence exacte des personnages (visage, coiffure, couleur de peau, vêtements, proportions, accessoires)
- Les décors et environnements
- Les objets, véhicules, bâtiments, logos
- Les couleurs, textures et styles

Pendant toute la génération, l'IA DOIT respecter ces références. Le personnage ne doit JAMAIS changer de visage, coiffure, couleur de peau, vêtements (sauf si demandé), proportions ou identité. Les décors doivent rester cohérents entre toutes les scènes.

### 3. Verrouillage des personnages
Chaque personnage possède une identité unique et permanente:
- Apparence fixe (visage, corps, vêtements)
- Voix constante
- Personnalité définie
- Expressions caractéristiques
- Façon de parler unique
- Mouvements reconnaissables

### 4. Références multiples
L'utilisateur peut importer plusieurs références (personnages, décors, véhicules, objets). Tu comprends les relations entre ces éléments et tu veilles à leur cohérence dans toutes les scènes.

### 5. Continuité parfaite
Une vidéo ne doit jamais donner l'impression que chaque scène a été générée séparément. Toutes les scènes respectent: continuité des personnages, lumière, décor, météo, heure, objets, vêtements.

### 6. Continuation de projet (mode "continue")
Tu récupères le scénario précédent, les personnages, les décors, l'historique, les dialogues et les relations, puis tu écris la suite NATURELLE sans aucune perte de mémoire.

### 7. Recherche d'informations (RAG)
Quand le projet nécessite des faits d'actualité, des lieux ou des informations publiques, tu utilises tes connaissances pour proposer des descriptions cohérentes et fidèles.

### 8. Publicités Premium (type "ad")
Pour le type "ad", tu produis: scénario marketing, storyboard, narration, mise en scène, éclairage, plans cinématographiques, design sonore, musique, voix. Le résultat doit être de qualité professionnelle, adapté au secteur et à la marque.

### 9. Réalisation cinématographique
Pour chaque vidéo, tu choisis automatiquement les meilleurs angles de caméra, mouvements, rythme du montage, transitions, éclairage, profondeur de champ et colorimétrie.

### 10. Contrôle qualité
Avant la génération finale, tu vérifies: scénario, logique, continuité, personnages, dialogues, décors, durée, rythme. Toute incohérence est corrigée automatiquement.

## Format de réponse
Tu réponds UNIQUEMENT avec un objet JSON valide (aucun texte autour, aucun markdown, aucune explication).

## Règles
- Tout le contenu doit être dans la langue demandée (par défaut Français).
- Sois précis, créatif et professionnel.
- Garde l'identité des personnages constante tout au long du projet.
- Le champ enhanced_script doit contenir le script narratif complet.
- Les engine_prompts doivent être concis, optimisés et adaptés à chaque moteur.
- Quand des images de référence sont fournies, décris chaque référence en détail dans les engine_prompts et dans l'apparence des personnages.
- Les scenes doivent inclure camera_angle, camera_movement, lighting et color_grade.`;

function buildUserMessage(payload) {
  const { prompt, type, options, mode, previousGeneration } = payload;
  const opts = options || {};
  let msg = `Projet Story221\nType de contenu: ${type}\nPrompt utilisateur: "${prompt}"\n`;
  msg += `Style: ${opts.style || "Cinématique"}\nDurée: ${opts.duration || 1} minute(s)\nLangue: ${opts.language || "Français"}\n`;
  if (opts.voice) msg += `Voix: ${opts.voice}\n`;
  if (opts.music && opts.music !== "Aucune") msg += `Ambiance musicale: ${opts.music}\n`;
  if (type === "ad") {
    if (opts.ad_sector) msg += `Secteur publicitaire: ${opts.ad_sector}\n`;
    if (opts.ad_brand_name) msg += `Marque: ${opts.ad_brand_name}\n`;
    if (opts.ad_message) msg += `Message: ${opts.ad_message}\n`;
    if (opts.ad_logo_url) msg += `Logo URL: ${opts.ad_logo_url}\n`;
    if (opts.ad_colors) msg += `Couleurs de marque: ${opts.ad_colors}\n`;
  }
  if (mode === "continue" && previousGeneration) {
    msg += `\nMODE CONTINUATION: écris la suite naturelle de l'histoire précédente. Garde les mêmes personnages et la même cohérence.\n`;
    msg += `Titre précédent: ${previousGeneration.title || ""}\n`;
    msg += `Script précédent: ${(previousGeneration.enhanced_script || "").substring(0, 3000)}\n`;
    msg += `Personnages précédents: ${JSON.stringify((previousGeneration.characters || []).map((c) => ({ name: c.name, description: c.description, appearance: c.appearance })))}\n`;
    msg += `Scènes précédentes: ${JSON.stringify((previousGeneration.scenes || []).slice(0, 8))}\n`;
  }
  msg += `\nRéponds UNIQUEMENT avec l'objet JSON décrit.`;
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();

    const geminiKey = Deno.env.get("gemini-2.5-pro");
    const anthropicKey = Deno.env.get("Anthropic");

    if (!geminiKey && !anthropicKey) {
      return Response.json({ error: "Aucune clé API (Gemini ou Anthropic) configurée" }, { status: 500 });
    }

    const userText = buildUserMessage(payload);
    const referenceImages = payload.reference_images || [];
    let lastError = "";

    // ---- Gemini path (preferred — uses your own key/credits) ----
    if (geminiKey) {
      const parts = [];
      if (referenceImages.length > 0) {
        parts.push({ text: `${referenceImages.length} image(s) de référence sont fournies ci-dessous. Analyse-les avec une précision extrême: identifie l'apparence exacte des personnages, décors, objets, couleurs et textures. Décris chaque référence en détail dans les engine_prompts et l'apparence des personnages.` });
        for (const imgUrl of referenceImages.slice(0, 5)) {
          parts.push({ text: `Image de référence ${imgUrl}:` });
          parts.push({ file_data: { file_uri: imgUrl, mime_type: "image/png" } });
        }
      }
      parts.push({ text: userText });

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 8192, responseMimeType: "application/json" },
          }),
        }
      );

      const gemData = await geminiResponse.json();
      if (geminiResponse.ok && gemData.candidates?.length) {
        const gemText = (gemData.candidates?.[0]?.content?.parts || []).filter((p) => p.text).map((p) => p.text).join("");
        try {
          return Response.json(extractJson(gemText));
        } catch { /* fall through */ }
      } else {
        lastError = `Gemini ${geminiResponse.status}: ${JSON.stringify(gemData).substring(0, 300)}`;
      }
    }

    // ---- Anthropic fallback ----
    if (anthropicKey) {
      const content = [];
      if (referenceImages.length > 0) {
        content.push({ type: "text", text: `${referenceImages.length} image(s) de référence sont fournies. Analyse-les avec précision et décris-les dans les engine_prompts et l'apparence des personnages.` });
        for (const imgUrl of referenceImages.slice(0, 5)) {
          content.push({ type: "image", source: { type: "url", url: imgUrl } });
        }
      }
      content.push({ type: "text", text: userText });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
        try {
          return Response.json(extractJson(text));
        } catch { /* fall through */ }
      } else {
        const errText = await response.text();
        lastError = `Anthropic ${response.status}: ${errText.substring(0, 300)}`;
      }
    }

    return Response.json({
      error: `Échec de la direction créative. ${lastError}`.trim(),
      hint: "Vérifiez les crédits de vos comptes API Anthropic et Gemini.",
    }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});