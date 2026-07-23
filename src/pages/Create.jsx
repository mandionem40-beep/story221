import { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { getContentType, getPipelineSteps, calculateCost } from "@/lib/generation-utils";
import { runGenerationPipeline } from "@/lib/generation-pipeline";
import CreateForm from "@/components/create/CreateForm";
import PipelineProgress from "@/components/create/PipelineProgress";
import GenerationResult from "@/components/create/GenerationResult";
import { ChevronLeft, Wand2, Sparkles } from "lucide-react";

export default function Create() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useOutletContext();
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [type, setType] = useState(urlParams.get("type") || "video");
  const [initialPrompt] = useState(urlParams.get("prompt") || "");
  const [initialDuration] = useState(parseInt(urlParams.get("duration")) || 1);
  const [initialStyle] = useState(urlParams.get("style") || "");
  const [initialLanguage] = useState(urlParams.get("language") || "");
  const [phase, setPhase] = useState("form"); // form | pipeline | result | error
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineError, setPipelineError] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [result, setResult] = useState(null);
  const continueId = urlParams.get("continue");
  const [continueGen, setContinueGen] = useState(null);

  useEffect(() => {
    if (continueId) {
      base44.entities.Generation.get(continueId)
        .then((g) => { setContinueGen(g); setType(g.type); })
        .catch(() => {});
    }
  }, [continueId]);

  // Subscribe to Generation entity for real-time pipeline progress
  useEffect(() => {
    if (!generation || phase !== "pipeline") return;
    const pipelineSteps = getPipelineSteps(type);
    const unsubscribe = base44.entities.Generation.subscribe((event) => {
      if (event.id === generation.id && event.type === "update") {
        const step = event.data?.pipeline_step;
        if (step) {
          const stepIdx = pipelineSteps.findIndex(s => s.id === step);
          if (stepIdx >= 0) setCurrentStep(stepIdx);
        }
      }
    });
    return unsubscribe;
  }, [generation, phase, type]);

  const steps = getPipelineSteps(type);

  const handleTypeChange = (newType) => {
    setType(newType);
    const params = new URLSearchParams(window.location.search);
    params.set("type", newType);
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  const handleSubmit = async ({ prompt, type: genType, options }) => {
    const cost = calculateCost(genType, options.duration);
    const user = await base44.auth.me();
    const useFreeTrial = !user.free_trial_used && cost > 0;

    if (!useFreeTrial && user.diamonds < cost) {
      toast({ title: "Solde insuffisant", description: "Achetez des diamants pour continuer.", variant: "destructive" });
      navigate("/app/diamonds");
      return;
    }

    // Create generation record
    const gen = await base44.entities.Generation.create({
      type: genType,
      prompt,
      cost_diamonds: cost,
      duration_minutes: options.duration,
      language: options.language,
      style: options.style,
      format: options.format,
      voice: options.voice,
      music: options.music,
      resolution: options.resolution,
      status: "processing",
      pipeline_step: "script",
      ad_sector: genType === "ad" ? options.adSector : undefined,
      ad_brand_name: genType === "ad" ? options.adBrandName : undefined,
      ad_logo_url: genType === "ad" ? options.adLogoUrl : undefined,
      ad_message: genType === "ad" ? options.adMessage : undefined,
      ad_colors: genType === "ad" ? options.adColors : undefined,
      ad_private_use: genType === "ad" ? options.adPrivateUse : false,
      reference_images: options.reference_images || [],
    });
    setGeneration(gen);

    // Run pipeline (credit deduction handled securely by backend)
    setPhase("pipeline");
    setCurrentStep(0);
    setPipelineError(null);

    await runGenerationPipeline(
      { prompt, type: genType, options, generationId: gen.id },
      {
        onStep: (stepIdx) => setCurrentStep(stepIdx),
        onComplete: (res) => {
          setResult(res);
          setPhase("result");
          refreshUser();
        },
        onError: (error) => {
          setPipelineError(error);
          setPhase("error");
          refreshUser();
        },
      }
    );
  };

  const handlePublish = async () => {
    if (!generation || !result) return;
    const reel = await base44.entities.Reel.create({
      generation_id: generation.id,
      title: result.title || "Création",
      video_url: result.videoUrl || result.resultUrl || "",
      thumbnail_url: result.characters?.[0]?.image_url || "",
      type: result.resultType === "image" ? "image" : result.resultType === "audio" ? "story" : "video",
      author_name: currentUser?.username || currentUser?.full_name || "Utilisateur",
      author_avatar: currentUser?.avatar_url || "",
    });
    await base44.entities.Generation.update(generation.id, {
      is_published: true,
      reel_id: reel.id,
    });
    setGeneration({ ...generation, is_published: true, reel_id: reel.id });
    toast({ title: "Publié !", description: "Votre création est maintenant dans les Reels." });

    // Check referral reward
    checkReferralReward();
  };

  const checkReferralReward = async () => {
    try {
      await base44.functions.invoke("process-referral", { action: "process_reward" });
    } catch { /* ignore */ }
  };

  const handleLaunchContinue = async () => {
    if (!continueGen) return;
    const genType = continueGen.type;
    const options = {
      duration: continueGen.duration_minutes || 1,
      language: continueGen.language || "Français",
      style: continueGen.style || "Cinématique",
      format: continueGen.format || "vertical",
      voice: continueGen.voice || "river",
      music: continueGen.music || "Aucune",
      resolution: continueGen.resolution || "720p",
    };
    const cost = calculateCost(genType, options.duration);
    const user = await base44.auth.me();
    const useFreeTrial = !user.free_trial_used && cost > 0;
    if (!useFreeTrial && user.diamonds < cost) {
      toast({ title: "Solde insuffisant", description: "Achetez des diamants pour continuer.", variant: "destructive" });
      navigate("/app/diamonds");
      return;
    }
    const prompt = `Continue cette histoire: ${continueGen.title || (continueGen.prompt || "").substring(0, 60)}`;
    const gen = await base44.entities.Generation.create({
      type: genType, prompt, cost_diamonds: cost, duration_minutes: options.duration,
      language: options.language, style: options.style, format: options.format, voice: options.voice,
      music: options.music, resolution: options.resolution, status: "processing", pipeline_step: "script",
      reference_images: continueGen.reference_images || [],
    });
    setGeneration(gen);
    setPhase("pipeline");
    setCurrentStep(0);
    setPipelineError(null);
    await runGenerationPipeline(
      { prompt, type: genType, options, generationId: gen.id, mode: "continue", previousGeneration: continueGen },
      {
        onStep: (stepIdx) => setCurrentStep(stepIdx),
        onComplete: (res) => { setResult(res); setPhase("result"); refreshUser(); },
        onError: (error) => { setPipelineError(error); setPhase("error"); refreshUser(); },
      }
    );
  };

  const handleNew = () => {
    setPhase("form");
    setGeneration(null);
    setResult(null);
    setCurrentStep(0);
    setPipelineError(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/app")} className="p-2 -ml-2 text-muted-foreground hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {phase === "form" && "Nouvelle création"}
            {phase === "pipeline" && "Génération"}
            {phase === "result" && "Résultat"}
            {phase === "error" && "Erreur"}
          </h1>
          <p className="text-sm text-muted-foreground">{getContentType(type).label}</p>
        </div>
      </div>

      {phase === "form" && continueId && !continueGen && (
        <div className="flex items-center justify-center py-20">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      )}

      {phase === "form" && continueId && continueGen && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Continuer l'histoire</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">{continueGen.title || "Création"}</h2>
            <p className="text-xs text-muted-foreground mb-3">{getContentType(continueGen.type).label} · {continueGen.duration_minutes} min · {continueGen.language}</p>
            {continueGen.enhanced_script && (
              <p className="text-sm text-muted-foreground line-clamp-3">{continueGen.enhanced_script.substring(0, 240)}…</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">Claude reprend le scénario, les personnages et les décors pour écrire la suite naturelle.</p>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/app/library")} className="text-sm text-muted-foreground hover:text-white">Annuler</button>
            <button onClick={handleLaunchContinue} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow-red-sm">
              Lancer la suite · {calculateCost(continueGen.type, continueGen.duration_minutes || 1)} 💎
            </button>
          </div>
        </div>
      )}

      {phase === "form" && !continueId && (
        <CreateForm type={type} onTypeChange={handleTypeChange} user={currentUser} onSubmit={handleSubmit} initialPrompt={initialPrompt} initialDuration={initialDuration} initialStyle={initialStyle} initialLanguage={initialLanguage} />
      )}

      {(phase === "pipeline" || phase === "error") && (
        <PipelineProgress steps={steps} currentStep={currentStep} error={pipelineError} />
      )}

      {phase === "error" && (
        <div className="max-w-md mx-auto px-4 pb-8">
          <button
            onClick={handleNew}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {phase === "result" && (
        <GenerationResult
          generation={generation}
          result={result}
          onPublish={handlePublish}
          onNew={handleNew}
        />
      )}
    </div>
  );
}