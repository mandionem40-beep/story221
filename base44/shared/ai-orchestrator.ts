// AI Orchestrator - Moteur central de coordination des modèles IA
// Pipeline complet: Direction créative → Images → Voix → Vidéo → Finalisation

import { runCreativeDirection } from "./creative-director.ts";

function buildVideoFallbackPrompt(script, characters, options, scenes) {
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

export async function runGenerationPipeline(base44, config) {
  const { prompt, type, options, generationId, mode, previousGeneration } = config;
  const opts = options || {};

  let title = "";
  let enhancedScript = "";
  let characters = [];
  let scenes = [];
  let dialogues = [];
  let voiceUrl = null;
  let videoUrl = null;
  let imageUrl = null;
  let enginePrompts = {};

  // Helper: update generation step
  const updateStep = async (step, extra = {}) => {
    try {
      await base44.asServiceRole.entities.Generation.update(generationId, {
        pipeline_step: step,
        status: "processing",
        ...extra,
      });
    } catch (e) {
      console.error(`Failed to update step ${step}:`, e.message);
    }
  };

  // ---- Step 1: Creative direction (Claude / Gemini) ----
  await updateStep("script");
  const pkg = await runCreativeDirection({
    prompt, type, options: opts,
    mode: mode || "create",
    previousGeneration: previousGeneration || null,
    reference_images: opts.reference_images || [],
  });

  title = pkg.title || "Création sans titre";
  enhancedScript = pkg.enhanced_script || (pkg.scenario && pkg.scenario.summary) || prompt;
  characters = (pkg.characters || []).map(c => ({
    name: c.name,
    description: c.description || c.personality || "",
    appearance: c.appearance || c.clothing || "",
    voice: c.voice || "",
    image_url: c.image_url,
    age: c.age || "",
    personality: c.personality || "",
    clothing: c.clothing || "",
    emotions: c.emotions || "",
    speech_style: c.speech_style || "",
  }));
  scenes = (pkg.scenes || []).map(s => typeof s === "string" ? s : (s.description || `Scène ${s.number || ""}`));
  dialogues = pkg.dialogues || [];
  enginePrompts = pkg.engine_prompts || {};

  await updateStep("scenes", { title, enhanced_script: enhancedScript, characters, scenes });

  // ---- Step 2: Character images ----
  if (characters.length > 0) {
    await updateStep("characters");
    for (const char of characters.slice(0, 3)) {
      try {
        const imgPrompt = `${enginePrompts.image || ("Portrait du personnage: " + char.name)}. ${char.appearance || char.description || ""}. Professional, detailed, high quality.`;
        const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: imgPrompt.substring(0, 500),
        });
        char.image_url = imgResult.url;
      } catch (e) {
        console.error(`Character image failed for ${char.name}:`, e.message);
      }
    }
    await updateStep("dialogues", { characters });
  } else {
    await updateStep("dialogues");
  }

  // ---- Step 3: Voice synthesis ----
  await updateStep("voice");
  const voiceText = (enginePrompts.voice || dialogues.map(d => d.text).join(" ") || enhancedScript).substring(0, 5000);
  try {
    const langCode = opts.language === "Wolof" ? "wo" : opts.language === "Anglais" ? "en" : "fr";
    const speechResult = await base44.asServiceRole.integrations.Core.GenerateSpeech({
      text: voiceText,
      voice: opts.voice || "river",
      language_code: langCode,
    });
    voiceUrl = speechResult.url;
  } catch (e) {
    console.error("Voice synthesis failed:", e.message);
  }

  // ---- Step 4: Video generation (with image fallback) ----
  await updateStep("video");
  const aspectRatio = opts.format === "vertical" ? "9:16" : "16:9";
  try {
    const videoPrompt = (enginePrompts.video || buildVideoFallbackPrompt(enhancedScript, characters, opts, scenes)).substring(0, 500);
    const videoResult = await base44.asServiceRole.integrations.Core.GenerateVideo({
      prompt: videoPrompt,
      duration: 8,
      aspect_ratio: aspectRatio,
    });
    videoUrl = videoResult.url;
  } catch (videoErr) {
    console.error("Video generation failed:", videoErr.message);
    // Fallback: generate image
    try {
      const imgPrompt = (enginePrompts.image || buildVideoFallbackPrompt(enhancedScript, characters, opts, scenes)).substring(0, 500);
      const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: imgPrompt,
      });
      imageUrl = imgResult.url;
    } catch (imgErr) {
      console.error("Image fallback also failed:", imgErr.message);
    }
  }

  // ---- Step 5: Finalize ----
  await updateStep("final");

  const resultUrl = videoUrl || imageUrl || voiceUrl;
  const resultType = videoUrl ? "video" : imageUrl ? "image" : voiceUrl ? "audio" : "text";

  await base44.asServiceRole.entities.Generation.update(generationId, {
    status: "completed",
    result_url: resultUrl,
    result_type: resultType,
    pipeline_step: null,
  });

  return {
    title,
    enhancedScript,
    characters,
    scenes,
    dialogues,
    voiceUrl,
    videoUrl,
    imageUrl,
    resultUrl,
    resultType,
    enginePrompts,
  };
}