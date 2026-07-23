// AI Orchestrator - Moteur central de coordination des modèles IA
// Pipeline complet: Direction créative (InvokeLLM) → Personnages (GenerateImage) → Voix (GenerateSpeech) → Vidéo (GenerateVideo) → Finalisation
// Toutes les intégrations utilisent les API natives de la plateforme (toujours disponibles)

import { runCreativeDirection } from "./creative-director.ts";

function buildVideoPrompt(pkg, opts) {
  const sceneDesc = pkg.scenes && pkg.scenes.length > 0
    ? pkg.scenes.slice(0, 3).map(s => typeof s === "string" ? s : s.description).join(" ")
    : pkg.enhanced_script?.substring(0, 300) || "";
  let p = pkg.engine_prompts?.video || "";
  if (!p) {
    p = `Cinematic video: ${sceneDesc}`;
  }
  const charDesc = (pkg.characters || []).slice(0, 2)
    .map(c => c.appearance || c.description || c.name)
    .filter(Boolean).join(", ");
  if (charDesc) p += `. Characters: ${charDesc}`;
  p += `. Visual style: ${opts.style || "Cinématique"}. Professional lighting, smooth camera motion, high quality.`;
  if (opts.music && opts.music !== "Aucune") p += ` Mood: ${opts.music}.`;
  if (opts.language === "Wolof") p += ` West African setting.`;
  return p.substring(0, 500);
}

function buildImagePrompt(pkg, opts) {
  let p = pkg.engine_prompts?.image || "";
  if (!p) {
    const charDesc = (pkg.characters || []).slice(0, 1)
      .map(c => `${c.name}: ${c.appearance || c.description || ""}`)
      .join("; ");
    p = `Portrait: ${charDesc || pkg.enhanced_script?.substring(0, 200) || ""}`;
  }
  p += `. Style: ${opts.style || "Cinématique"}. Professional, detailed, high quality.`;
  return p.substring(0, 500);
}

function buildVoiceText(pkg) {
  if (pkg.engine_prompts?.voice) return pkg.engine_prompts.voice.substring(0, 5000);
  const dialogues = (pkg.dialogues || []).map(d => d.text).join(" ");
  if (dialogues) return dialogues.substring(0, 5000);
  const sceneDialogues = (pkg.scenes || [])
    .map(s => typeof s === "object" ? s.dialogue : null)
    .filter(Boolean).join(" ");
  if (sceneDialogues) return sceneDialogues.substring(0, 5000);
  return (pkg.enhanced_script || "").substring(0, 5000);
}

function computeSubtitles(pkg, totalDurationSec) {
  // If creative director already provided subtitles, use them
  if (pkg.subtitles && pkg.subtitles.length > 0) return pkg.subtitles;

  // Otherwise, compute from scenes with cumulative timestamps
  const subtitles = [];
  let elapsed = 0;
  for (const scene of (pkg.scenes || [])) {
    if (typeof scene === "string") {
      subtitles.push({ timestamp: formatTimestamp(elapsed), text: scene.substring(0, 100) });
      elapsed += 8;
    } else {
      const dur = scene.duration_seconds || 8;
      const text = scene.dialogue || scene.description?.substring(0, 100) || "";
      if (text) {
        subtitles.push({ timestamp: formatTimestamp(elapsed), text });
      }
      elapsed += dur;
    }
  }
  return subtitles;
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getLanguageCode(language) {
  if (language === "Wolof") return "wo";
  if (language === "Anglais" || language === "English") return "en";
  return "fr";
}

const VIDEO_TYPES = ["video", "film", "serie", "anime", "cartoon", "ad", "music_clip"];
const IMAGE_TYPES = ["image", "character", "influencer"];
const VOICE_TYPES = ["voice"];
const TEXT_TYPES = ["story", "storyboard"];

export async function runGenerationPipeline(base44, config) {
  const { prompt, type, options, generationId, mode, previousGeneration } = config;
  const opts = options || {};

  let title = "";
  let synopsis = "";
  let enhancedScript = "";
  let characters = [];
  let scenes = [];
  let dialogues = [];
  let storyboard = [];
  let subtitles = [];
  let continuityNotes = "";
  let voiceUrl = null;
  let videoUrl = null;
  let imageUrl = null;
  let enginePrompts = {};
  let adConcept = "", adSlogan = "", adCta = "";

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

  // ==== STEP 1: Creative Direction (Claude/Gemini via InvokeLLM) ====
  await updateStep("script");
  const pkg = await runCreativeDirection(base44, {
    prompt,
    type,
    options: opts,
    mode: mode || "create",
    previousGeneration: previousGeneration || null,
    reference_images: opts.reference_images || [],
  });

  title = pkg.title || "Création sans titre";
  synopsis = pkg.synopsis || "";
  enhancedScript = pkg.enhanced_script || prompt;
  characters = (pkg.characters || []).map(c => ({
    name: c.name || "",
    description: c.description || "",
    appearance: c.appearance || "",
    voice: c.voice || "",
    personality: c.personality || "",
    clothing: c.clothing || "",
    age: c.age || "",
    emotions: c.emotions || "",
    speech_style: c.speech_style || "",
    image_url: c.image_url || "",
  }));
  scenes = (pkg.scenes || []).map((s, i) => {
    if (typeof s === "string") return { number: i + 1, description: s };
    return { ...s, number: s.number || i + 1 };
  });
  dialogues = pkg.dialogues || [];
  storyboard = pkg.storyboard || [];
  enginePrompts = pkg.engine_prompts || {};
  continuityNotes = pkg.continuity_notes || "";
  adConcept = pkg.ad_concept || "";
  adSlogan = pkg.ad_slogan || "";
  adCta = pkg.ad_cta || "";

  await updateStep("scenes", {
    title, synopsis, enhanced_script: enhancedScript,
    characters: characters.map(c => ({ name: c.name, description: c.description, appearance: c.appearance, voice: c.voice, personality: c.personality })),
    scenes,
    dialogues,
    storyboard,
    continuity_notes: continuityNotes,
    ad_concept: adConcept,
    ad_slogan: adSlogan,
    ad_cta: adCta,
  });

  // ==== STEP 2: Character Images (GenerateImage) ====
  if (characters.length > 0) {
    await updateStep("characters");
    for (const char of characters.slice(0, 3)) {
      try {
        const charPrompt = `${enginePrompts.image || ("Portrait of character: " + char.name)}. ${char.appearance || char.description || ""}. ${char.clothing ? "Wearing: " + char.clothing : ""}. Professional, detailed, high quality portrait.`;
        const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: charPrompt.substring(0, 500),
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

  // ==== STEP 3: Voice Synthesis (GenerateSpeech) ====
  if (VIDEO_TYPES.includes(type) || VOICE_TYPES.includes(type)) {
    await updateStep("voice");
    const voiceText = buildVoiceText(pkg);
    if (voiceText && voiceText.trim().length > 0) {
      try {
        const langCode = getLanguageCode(opts.language);
        const speechResult = await base44.asServiceRole.integrations.Core.GenerateSpeech({
          text: voiceText,
          voice: opts.voice || "river",
          language_code: langCode,
        });
        voiceUrl = speechResult.url;
        await updateStep("video", { voice_url: voiceUrl });
      } catch (e) {
        console.error("Voice synthesis failed:", e.message);
        await updateStep("video");
      }
    } else {
      await updateStep("video");
    }
  }

  // ==== STEP 4: Video or Image Generation ====
  if (VIDEO_TYPES.includes(type)) {
    // Video generation via GenerateVideo
    try {
      const videoPrompt = buildVideoPrompt(pkg, opts);
      const aspectRatio = opts.format === "horizontal" ? "16:9" : opts.format === "square" ? "16:9" : "9:16";
      const videoResult = await base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt: videoPrompt,
        duration: 8,
        aspect_ratio: aspectRatio,
      });
      videoUrl = videoResult.url;
    } catch (videoErr) {
      console.error("Video generation failed:", videoErr.message);
      // Fallback: generate a representative image
      try {
        const imgPrompt = buildImagePrompt(pkg, opts);
        const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: imgPrompt,
        });
        imageUrl = imgResult.url;
      } catch (imgErr) {
        console.error("Image fallback also failed:", imgErr.message);
      }
    }
  } else if (IMAGE_TYPES.includes(type)) {
    // Image generation via GenerateImage
    try {
      const imgPrompt = buildImagePrompt(pkg, opts);
      const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: imgPrompt,
      });
      imageUrl = imgResult.url;
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr.message);
    }
  }

  // ==== STEP 5: Subtitles ====
  await updateStep("subtitles");
  const totalDurationSec = (opts.duration || 1) * 60;
  subtitles = computeSubtitles(pkg, totalDurationSec);

  // ==== STEP 6: Finalize ====
  await updateStep("final");

  const resultUrl = videoUrl || imageUrl || voiceUrl;
  const resultType = videoUrl ? "video" : imageUrl ? "image" : voiceUrl ? "audio" : "text";

  await base44.asServiceRole.entities.Generation.update(generationId, {
    status: "completed",
    result_url: resultUrl,
    voice_url: voiceUrl,
    result_type: resultType,
    pipeline_step: null,
    subtitles,
    characters,
    scenes,
    storyboard,
    dialogues,
    synopsis,
  });

  return {
    title,
    synopsis,
    enhancedScript,
    characters,
    scenes,
    dialogues,
    storyboard,
    subtitles,
    continuityNotes,
    voiceUrl,
    videoUrl,
    imageUrl,
    resultUrl,
    resultType,
    enginePrompts,
    adConcept,
    adSlogan,
    adCta,
  };
}