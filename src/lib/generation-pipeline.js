import { base44 } from "@/api/base44Client";
import { getPipelineSteps } from "./generation-utils";

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

export async function runGenerationPipeline(config, callbacks) {
  const { prompt, type, options, generationId, mode, previousGeneration } = config;
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
  let enginePrompts = {};

  try {
    // Step: Creative direction by Claude (intent, optimized prompt, scenario, scenes, characters, dialogues, engine prompts)
    const scriptStepIdx = steps.findIndex(s => s.id === "script" || s.id === "prompt" || s.id === "text");
    if (scriptStepIdx >= 0) {
      onStep(scriptStepIdx);
      const res = await base44.functions.invoke("claude-director", {
        prompt, type, options, mode: mode || "create", previousGeneration: previousGeneration || null,
        reference_images: options.reference_images || [],
      });
      const pkg = res.data || {};
      title = pkg.title || "Création sans titre";
      enhancedScript = pkg.enhanced_script || pkg.scenario?.summary || prompt;
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
      await base44.entities.Generation.update(generationId, {
        title, enhanced_script: enhancedScript, characters, scenes, pipeline_step: steps[scriptStepIdx].id,
      });
    }

    // Step: Scenes (already produced by Claude) — persist & mark done
    const scenesStepIdx = steps.findIndex(s => s.id === "scenes");
    if (scenesStepIdx >= 0) {
      onStep(scenesStepIdx);
      await base44.entities.Generation.update(generationId, { scenes, pipeline_step: "scenes" });
    }

    // Step: Character images
    const charStepIdx = steps.findIndex(s => s.id === "characters");
    if (charStepIdx >= 0 && characters.length > 0) {
      onStep(charStepIdx);
      for (const char of characters.slice(0, 3)) {
        try {
          const imgResult = await base44.integrations.Core.GenerateImage({
            prompt: `${enginePrompts.image || ("Portrait du personnage: " + char.name)}. ${char.appearance || char.description || ""}.`,
          });
          char.image_url = imgResult.url;
        } catch { /* continue without image */ }
      }
      await base44.entities.Generation.update(generationId, { characters, pipeline_step: "characters" });
    }

    // Step: Dialogues (already produced by Claude) — mark done
    const dialogueStepIdx = steps.findIndex(s => s.id === "dialogues");
    if (dialogueStepIdx >= 0) {
      onStep(dialogueStepIdx);
      await base44.entities.Generation.update(generationId, { pipeline_step: "dialogues" });
    }

    // Step: Voice synthesis (uses Claude's optimized voice prompt / dialogues)
    const voiceStepIdx = steps.findIndex(s => s.id === "voice");
    if (voiceStepIdx >= 0) {
      onStep(voiceStepIdx);
      const voiceText = (enginePrompts.voice || dialogues.map(d => d.text).join(" ") || enhancedScript).substring(0, 5000);
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

    // Step: Video generation (uses Claude's optimized video prompt)
    const videoStepIdx = steps.findIndex(s => s.id === "video");
    if (videoStepIdx >= 0) {
      onStep(videoStepIdx);
      const aspectRatio = options.format === "vertical" ? "9:16" : "16:9";
      try {
        const videoResult = await base44.integrations.Core.GenerateVideo({
          prompt: (enginePrompts.video || buildVideoFallbackPrompt(enhancedScript, characters, options, scenes)).substring(0, 500),
          duration: 8,
          aspect_ratio: aspectRatio,
        });
        videoUrl = videoResult.url;
      } catch (videoErr) {
        console.error("Video generation failed:", videoErr);
        try {
          const imgResult = await base44.integrations.Core.GenerateImage({
            prompt: (enginePrompts.image || buildVideoFallbackPrompt(enhancedScript, characters, options, scenes)).substring(0, 500),
          });
          imageUrl = imgResult.url;
        } catch (imgErr) {
          console.error("Image fallback also failed:", imgErr);
        }
      }
      await base44.entities.Generation.update(generationId, { pipeline_step: "video" });
    }

    // Step: Image generation (image/character types)
    const genStepIdx = steps.findIndex(s => s.id === "generate");
    if (genStepIdx >= 0 && !videoUrl) {
      onStep(genStepIdx);
      try {
        const imgResult = await base44.integrations.Core.GenerateImage({
          prompt: (enginePrompts.image || `${prompt}. Style: ${options.style}. Haute qualité, détaillé.`).substring(0, 500),
        });
        imageUrl = imgResult.url;
      } catch { /* continue */ }
    }

    // Step: Story content (already produced by Claude as enhanced_script)
    const contentStepIdx = steps.findIndex(s => s.id === "content");
    if (contentStepIdx >= 0) {
      onStep(contentStepIdx);
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
      voiceUrl, videoUrl, imageUrl, resultUrl, resultType, enginePrompts,
    });
  } catch (error) {
    await base44.entities.Generation.update(generationId, {
      status: "failed",
      pipeline_step: null,
    }).catch(() => {});
    onError(error);
  }
}