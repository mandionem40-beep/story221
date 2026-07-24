import { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { runGenerationPipeline } from "@/lib/generation-pipeline";
import { getPipelineSteps } from "@/lib/generation-utils";
import {
  characterCategories, quickDurations, quickVoices, quickMusics, quickFormats,
  quickLanguages, defaultScenarios, randomizeCharacter, pickRandomScenario, buildPrompt,
} from "@/lib/quick-create-data";

import CharacterTypeStep from "@/components/quick-create/CharacterTypeStep";
import BuildCharacterStep from "@/components/quick-create/BuildCharacterStep";
import StoryStep from "@/components/quick-create/StoryStep";
import SettingsStep from "@/components/quick-create/SettingsStep";
import SummaryStep from "@/components/quick-create/SummaryStep";
import GenerationReveal from "@/components/quick-create/GenerationReveal";
import QuickCreateResult from "@/components/quick-create/QuickCreateResult";
import { ChevronLeft } from "lucide-react";

export default function QuickCreate() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useOutletContext();

  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState({ category: null, appearance: null, color: null, visualStyle: null, traits: [], name: "" });
  const [story, setStory] = useState({ scenario: null, secondCharacter: null, detail: "" });
  const [settings, setSettings] = useState({
    duration: quickDurations[1], voice: "river", language: "Français", music: "Joyeuse", format: "vertical",
  });
  const [scenarios, setScenarios] = useState([]);
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [showcases, setShowcases] = useState([]);

  const [phase, setPhase] = useState("form"); // form | pipeline | result | error
  const [generation, setGeneration] = useState(null);
  const [result, setResult] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineError, setPipelineError] = useState(null);

  useEffect(() => {
    base44.entities.ScenarioTemplate.filter({ active: true }, "display_order", 50)
      .then(setScenarios).catch(() => setScenarios([]));
    if (currentUser?.id) {
      base44.entities.Character.filter({ created_by_id: currentUser.id }, "-created_date", 50)
        .then(setSavedCharacters).catch(() => {});
    }
    base44.entities.ShowcaseVideo.filter({ active: true }, "display_order", 50)
      .then(setShowcases).catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    if (!generation || phase !== "pipeline") return;
    const steps = getPipelineSteps("video");
    const unsubscribe = base44.entities.Generation.subscribe((event) => {
      if (event.id === generation.id && event.type === "update") {
        const sp = event.data?.pipeline_step;
        if (sp) {
          const idx = steps.findIndex(s => s.id === sp);
          if (idx >= 0) setPipelineStep(idx);
        }
      }
    });
    return unsubscribe;
  }, [generation, phase]);

  const cost = settings.duration.cost;

  const handleSurprise = () => {
    const rand = randomizeCharacter();
    setCharacter(rand);
    const sc = pickRandomScenario(scenarios);
    setStory({ scenario: sc, secondCharacter: null, detail: "" });
    setStep(5);
  };

  const handleGenerate = async () => {
    const user = await base44.auth.me();
    const useFreeTrial = !user.free_trial_used && cost > 0;
    if (!useFreeTrial && user.diamonds < cost) {
      toast({ title: "Solde insuffisant", description: "Achetez des diamants pour continuer.", variant: "destructive" });
      navigate("/app/diamonds");
      return;
    }

    const prompt = buildPrompt(character, story, settings);
    const gen = await base44.entities.Generation.create({
      type: "video",
      prompt,
      cost_diamonds: cost,
      duration_minutes: settings.duration.minutes,
      language: settings.language,
      style: character.visualStyle?.label || "Cinématique",
      format: settings.format,
      voice: settings.voice,
      music: settings.music,
      resolution: "720p",
      status: "processing",
      pipeline_step: "script",
      reference_images: [],
    });
    setGeneration(gen);
    setPhase("pipeline");
    setPipelineStep(0);
    setPipelineError(null);

    await runGenerationPipeline(
      { prompt, type: "video", options: { duration: settings.duration.minutes, language: settings.language, style: character.visualStyle?.label, format: settings.format, voice: settings.voice, music: settings.music, resolution: "720p" }, generationId: gen.id },
      {
        onComplete: (res) => { setResult(res); setPhase("result"); refreshUser(); },
        onError: (error) => { setPipelineError(error); setPhase("error"); refreshUser(); },
      }
    );
  };

  const handlePublish = async () => {
    if (!generation || !result) return;
    const reel = await base44.entities.Reel.create({
      generation_id: generation.id,
      title: result.title || `${character.name} — ${story.scenario?.title || "Aventure"}`,
      video_url: result.videoUrl || result.resultUrl || "",
      thumbnail_url: result.characters?.[0]?.image_url || "",
      type: "video",
      author_name: currentUser?.username || currentUser?.full_name || "Utilisateur",
      author_avatar: currentUser?.avatar_url || "",
    });
    await base44.entities.Generation.update(generation.id, { is_published: true, reel_id: reel.id });
    setGeneration({ ...generation, is_published: true, reel_id: reel.id });
    toast({ title: "Publié !", description: "Votre création est dans les Reels." });
    base44.functions.invoke("publish-to-socials", { videoUrl: reel.video_url, caption: reel.title, mediaType: "video" }).catch(() => {});
    base44.functions.invoke("process-referral", { action: "process_reward" }).catch(() => {});
  };

  const handleSaveCharacter = async () => {
    await base44.entities.Character.create({
      name: character.name,
      category: character.category,
      appearance: character.appearance?.label,
      color: character.color?.label,
      visual_style: character.visualStyle?.label,
      personality_traits: character.traits,
      voice: settings.voice,
      share_enabled: false,
    });
    toast({ title: "Personnage sauvegardé !", description: "Retrouvez-le dans votre Bibliothèque." });
  };

  const handleEpisode2 = () => {
    if (!generation) return;
    navigate(`/app/create?continue=${generation.id}&type=video`);
  };

  const handleNew = () => {
    setPhase("form");
    setStep(1);
    setGeneration(null);
    setResult(null);
    setPipelineStep(0);
    setPipelineError(null);
    setCharacter({ category: null, appearance: null, color: null, visualStyle: null, traits: [], name: "" });
    setStory({ scenario: null, secondCharacter: null, detail: "" });
  };

  if (phase === "pipeline" || phase === "error") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <GenerationReveal currentStep={pipelineStep} error={pipelineError} />
        {phase === "error" && (
          <div className="max-w-md mx-auto px-4 pb-8">
            <button onClick={handleNew} className="w-full py-3 rounded-xl bg-primary text-white font-semibold">
              Recommencer
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <QuickCreateResult
          generation={generation}
          result={result}
          character={character}
          onPublish={handlePublish}
          onNew={handleNew}
          onSaveCharacter={handleSaveCharacter}
          onEpisode2={handleEpisode2}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back to home */}
      {step === 1 && (
        <button onClick={() => navigate("/app")} className="p-2 -ml-2 text-muted-foreground hover:text-white mb-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-1.5 mb-6">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      {step === 1 && <CharacterTypeStep showcases={showcases} onSelect={(cat) => { setCharacter({ ...character, category: cat.id, appearance: null }); setStep(2); }} onSurprise={handleSurprise} />}
      {step === 2 && <BuildCharacterStep character={character} onChange={setCharacter} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StoryStep story={story} scenarios={scenarios.length > 0 ? scenarios : defaultScenarios} savedCharacters={savedCharacters} onChange={setStory} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <SettingsStep settings={settings} onChange={setSettings} onNext={() => setStep(5)} onBack={() => setStep(3)} diamonds={currentUser?.diamonds ?? 0} />}
      {step === 5 && <SummaryStep character={character} story={story} settings={settings} cost={cost} onGenerate={handleGenerate} onBack={() => setStep(4)} generating={false} />}
    </div>
  );
}