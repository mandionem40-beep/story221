import { base44 } from "@/api/base44Client";
import { getPipelineSteps } from "./generation-utils";

function buildScriptPrompt(prompt, type, options) {
  const typeLabels = {
    video: "une vidéo", film: "un film", serie: "un épisode de série",
    anime: "un anime", cartoon: "un cartoon", ad: "une publicité",
    music_clip: "un clip musical", story: "une histoire", storyboard: "un storyboard",
  };
  const typeLabel = typeLabels[type] || "un contenu";
  let p = `Tu es un scénariste professionnel. Améliore et enrichis ce prompt pour créer ${typeLabel}.\n\nPrompt: "${prompt}"\n`;
  p += `Style: ${options.style}\nDurée: ${options.duration} minutes\nLangue: ${options.language}\n`;
  if (type === "ad" && options.ad_sector) {
    p += `Secteur publicitaire: ${options.ad_sector}\n`;
    if (options.ad_brand_name) p += `Marque: ${options.ad_brand_name}\n`;
    if (options.ad_message) p += `Message: ${options.ad_message}\n`;
  }
  p += `\nRéponds en JSON avec: title (string), enhanced_script (string - le script complet et détaillé), characters (array d'objets {name, description, appearance}).`;
  if (options.language === "Wolof") {
    p += " Le script et les descriptions doivent être en Wolof.";
  }
  return p;
}

function buildVideoPrompt(script, characters, options, scenes) {
  const sceneDesc = scenes && scenes.length > 0
    ? scenes.slice(0, 3).join(" ")
    : script;
  let p = `Cinematic video scene: ${sceneDesc}`;
  if (characters.length > 0) {
    p += `. Characters: ${characters.map(c => c.appearance || c.description || c.name).slice(0, 2).join(", ")}`;
  }
  p += `. Visual style: ${options.style || "Cinématique"}. High quality, detailed, professional lighting, smooth camera motion.`;
  if (options.music && options.music !== "Aucune") {
    p += ` Mood: ${options.music}.`;
  }
  return p.substring(0, 500);
}

function buildImagePrompt(prompt, options) {
  return `${prompt}. Style: ${options.style}. Haute qualité, détaillé, professionnel.`;
}

export async function runGenerationPipeline(config, callbacks) {
  const { prompt, type, options, generationId } = config;
  const { onStep, onComplete, onError } = callbacks;
  const steps = getPipelineSteps(type);

  let title = "";
  let enhancedScript = "";
  let characters = [];
  let scenes = [];
  let dialogues = [];
  let voiceUrl = null;
  let videoUrl = null;
  let imageUrl = null;

  try {
    // Step: Script enhancement
    const scriptStepIdx = steps.findIndex(s => s.id === "script" || s.id === "prompt");
    if (scriptStepIdx >= 0) {
      onStep(scriptStepIdx);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildScriptPrompt(prompt, type, options),
        model: "gemini_3_1_pro",
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            enhanced_script: { type: "string" },
            characters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  appearance: { type: "string" }
                }
              }
            }
          }
        }
      });
      title = result.title || "Création sans titre";
      enhancedScript = result.enhanced_script || prompt;
      characters = result.characters || [];
      await base44.entities.Generation.update(generationId, {
        title, enhanced_script: enhancedScript, characters, pipeline_step: steps[scriptStepIdx].id,
      });
    }

    // Step: Scenes
    const scenesStepIdx = steps.findIndex(s => s.id === "scenes");
    if (scenesStepIdx >= 0) {
      onStep(scenesStepIdx);
      const sceneCount = Math.max(3, Math.ceil(options.duration * 2));
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Découpe ce script en ${sceneCount} scènes cohérentes pour une vidéo de ${options.duration} minutes.\n\nScript: "${enhancedScript}"\n\nRéponds en JSON avec: scenes (array de strings, chaque string est une description de scène).`,
        model: "gemini_3_1_pro",
        response_json_schema: {
          type: "object",
          properties: { scenes: { type: "array", items: { type: "string" } } }
        }
      });
      scenes = result.scenes || [];
      await base44.entities.Generation.update(generationId, { scenes, pipeline_step: "scenes" });
    }

    // Step: Character images
    const charStepIdx = steps.findIndex(s => s.id === "characters");
    if (charStepIdx >= 0 && characters.length > 0) {
      onStep(charStepIdx);
      for (const char of characters.slice(0, 3)) {
        try {
          const imgResult = await base44.integrations.Core.GenerateImage({
            prompt: `Portrait du personnage: ${char.name}. ${char.appearance || char.description || ""}. Style: ${options.style}.`,
          });
          char.image_url = imgResult.url;
        } catch { /* continue without image */ }
      }
      await base44.entities.Generation.update(generationId, { characters, pipeline_step: "characters" });
    }

    // Step: Dialogues
    const dialogueStepIdx = steps.findIndex(s => s.id === "dialogues");
    if (dialogueStepIdx >= 0) {
      onStep(dialogueStepIdx);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Génère les dialogues pour chaque scène.\n\nScènes: ${JSON.stringify(scenes)}\nPersonnages: ${JSON.stringify(characters.map(c => c.name))}\nLangue: ${options.language}\n\nRéponds en JSON avec: dialogues (array d'objets {scene, text}).`,
        model: "gemini_3_1_pro",
        response_json_schema: {
          type: "object",
          properties: {
            dialogues: { type: "array", items: { type: "object", properties: { scene: { type: "string" }, text: { type: "string" } } } }
          }
        }
      });
      dialogues = result.dialogues || [];
      await base44.entities.Generation.update(generationId, { pipeline_step: "dialogues" });
    }

    // Step: Voice
    const voiceStepIdx = steps.findIndex(s => s.id === "voice");
    if (voiceStepIdx >= 0) {
      onStep(voiceStepIdx);
      const voiceText = (dialogues.map(d => d.text).join(" ") || enhancedScript).substring(0, 5000);
      try {
        const langCode = options.language === "Wolof" ? "wo" : options.language === "Anglais" ? "en" : "fr";
        const speechResult = await base44.integrations.Core.GenerateSpeech({
          text: voiceText,
          voice: options.voice || "river",
          language_code: langCode,
        });
        voiceUrl = speechResult.url;
      } catch { /* continue without voice */ }
      await base44.entities.Generation.update(generationId, { pipeline_step: "voice" });
    }

    // Step: Video generation
    const videoStepIdx = steps.findIndex(s => s.id === "video");
    if (videoStepIdx >= 0) {
      onStep(videoStepIdx);
      const aspectRatio = options.format === "vertical" ? "9:16" : "16:9";
      try {
        const videoResult = await base44.integrations.Core.GenerateVideo({
          prompt: buildVideoPrompt(enhancedScript, characters, options, scenes),
          duration: 4,
          aspect_ratio: aspectRatio,
        });
        videoUrl = videoResult.url;
      } catch (videoErr) {
        console.error("Video generation failed:", videoErr);
        // Fallback: generate a thumbnail image so the user gets a visual result
        try {
          const imgResult = await base44.integrations.Core.GenerateImage({
            prompt: buildImagePrompt(buildVideoPrompt(enhancedScript, characters, options, scenes), options),
          });
          imageUrl = imgResult.url;
        } catch (imgErr) {
          console.error("Image fallback also failed:", imgErr);
        }
      }
      await base44.entities.Generation.update(generationId, { pipeline_step: "video" });
    }

    // Step: Image generation (for image/character types)
    const genStepIdx = steps.findIndex(s => s.id === "generate");
    if (genStepIdx >= 0 && !videoUrl) {
      onStep(genStepIdx);
      try {
        const imgResult = await base44.integrations.Core.GenerateImage({
          prompt: buildImagePrompt(prompt, options),
        });
        imageUrl = imgResult.url;
      } catch { /* continue */ }
    }

    // Step: Story content
    const contentStepIdx = steps.findIndex(s => s.id === "content");
    if (contentStepIdx >= 0) {
      onStep(contentStepIdx);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Écris une histoire complète et captivante basée sur: "${prompt}". Style: ${options.style}. Langue: ${options.language}. Longueur: ${options.duration * 500} mots environ.`,
        model: "gemini_3_1_pro",
      });
      enhancedScript = typeof result === "string" ? result : result?.enhanced_script || enhancedScript;
      await base44.entities.Generation.update(generationId, { enhanced_script: enhancedScript, pipeline_step: "content" });
    }

    // Step: Final
    const finalStepIdx = steps.findIndex(s => s.id === "final");
    if (finalStepIdx >= 0) {
      onStep(finalStepIdx);
    }

    // Determine result
    const resultUrl = videoUrl || imageUrl || voiceUrl;
    const resultType = videoUrl ? "video" : imageUrl ? "image" : voiceUrl ? "audio" : "text";

    await base44.entities.Generation.update(generationId, {
      status: "completed",
      result_url: resultUrl,
      result_type: resultType,
      pipeline_step: null,
    });

    onComplete({
      title, enhancedScript, characters, scenes, dialogues,
      voiceUrl, videoUrl, imageUrl, resultUrl, resultType,
    });
  } catch (error) {
    await base44.entities.Generation.update(generationId, {
      status: "failed",
      pipeline_step: null,
    }).catch(() => {});
    onError(error);
  }
}