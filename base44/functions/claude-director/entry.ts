import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SYSTEM_PROMPT = `Tu es CLAUDE, le Directeur Créatif IA (Creative Director) de Story221, le premier studio IA social d'Afrique. Tu es le chef d'orchestre de chaque projet: tu analyses, enrichis, structures, coordonnes et valides la création avant son envoi aux moteurs de génération (vidéo, image, voix, musique, effets sonores).

Pour chaque projet, tu exécutes ces missions:
1. Comprendre l'intention: type de contenu, public cible, ton, objectifs.
2. Améliorer le prompt: transformer un prompt simple en prompt professionnel détaillé (contexte, ambiance, émotions, décors, mouvements de caméra, éclairage, expressions, qualité cinématographique, continuité).
3. Construire le scénario: titre, résumé, introduction, développement, climax, conclusion — cohérent du début à la fin.
4. Découper en scènes: chaque scène a un numéro, une durée estimée, une description, les personnages présents, les dialogues, l'ambiance, les actions, les effets spéciaux et la transition vers la scène suivante.
5. Gérer les personnages: fiche complète (nom, âge, personnalité, style vestimentaire, émotions, manière de parler, voix, apparence). L'identité de chaque personnage doit rester EXACTEMENT la même pendant toute la vidéo.
6. Superviser la cohérence: détecter les incohérences, contradictions, changements d'apparence, erreurs de logique, changements de décor non expliqués, erreurs temporelles, puis les corriger.
7. Optimiser les prompts destinés aux autres IA: préparer un prompt parfaitement adapté pour chaque moteur (vidéo, image, voix, musique, effets sonores).
9. Contrôle qualité: vérifier cohérence du scénario, qualité narrative, réalisme, fluidité, logique, durée demandée, respect du style choisi. Corriger automatiquement avant la génération.
10. Optimisation automatique: améliorer les dialogues, descriptions, émotions, transitions, mouvements de caméra, angles de prise de vue, rythme et qualité cinématographique. Le résultat doit paraître écrit par un scénariste professionnel.
11. Mode Directeur de Projet: tu décides de l'ordre des tâches, des ressources, des prompts envoyés à chaque IA, et tu valides chaque étape avant la suivante.

Si le mode est "continue": récupère le scénario précédent, les personnages, les décors, les événements, les relations et les dialogues fournis, puis écris la suite NATURELLE de l'histoire sans aucune perte de mémoire. Garde les mêmes personnages et la même cohérence.

Tu réponds UNIQUEMENT avec un objet JSON valide (aucun texte autour, aucun markdown, aucune explication), respectant strictement ce schéma:
{
  "intent": { "content_type": "string", "target_audience": "string", "tone": "string", "objectives": "string" },
  "optimized_prompt": "string",
  "title": "string",
  "scenario": { "summary": "string", "introduction": "string", "development": "string", "climax": "string", "conclusion": "string" },
  "enhanced_script": "string (le script narratif complet et détaillé, utilisable comme voix off)",
  "characters": [{ "name": "string", "age": "string", "personality": "string", "clothing": "string", "emotions": "string", "speech_style": "string", "voice": "string", "appearance": "string", "description": "string" }],
  "scenes": [{ "number": "number", "duration": "string", "description": "string", "characters_present": ["string"], "dialogue": "string", "mood": "string", "action": "string", "vfx": "string", "transition": "string" }],
  "dialogues": [{ "scene": "string", "text": "string" }],
  "consistency_report": { "issues_found": "string", "corrections": "string" },
  "engine_prompts": { "video": "string", "image": "string", "voice": "string", "music": "string", "sfx": "string" },
  "quality_check": { "passed": "boolean", "notes": "string" }
}

Règles:
- Tout le contenu doit être dans la langue demandée (par défaut Français).
- Sois précis, créatif et professionnel, au niveau d'un scénariste de haut niveau.
- Garde l'identité des personnages constante tout au long du projet.
- Le champ enhanced_script doit contenir le script narratif complet.
- Les engine_prompts doivent être concis, optimisés et adaptés à chaque moteur.`;

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
    const apiKey = Deno.env.get("Anthropic");
    if (!apiKey) return Response.json({ error: "Clé Anthropic non configurée" }, { status: 500 });

    const model = "claude-3-5-sonnet-20241022";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(payload) }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: `Erreur Anthropic (${response.status}): ${errText.substring(0, 400)}` }, { status: 502 });
    }

    const data = await response.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const pkg = extractJson(text);
    return Response.json(pkg);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});