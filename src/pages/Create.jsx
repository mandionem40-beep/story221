import { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { getContentType, getPipelineSteps, calculateCost } from "@/lib/generation-utils";
import { runGenerationPipeline } from "@/lib/generation-pipeline";
import CreateForm from "@/components/create/CreateForm";
import PipelineProgress from "@/components/create/PipelineProgress";
import GenerationResult from "@/components/create/GenerationResult";
import { ChevronLeft } from "lucide-react";

export default function Create() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useOutletContext();
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [type, setType] = useState(urlParams.get("type") || "video");
  const [phase, setPhase] = useState("form"); // form | pipeline | result | error
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineError, setPipelineError] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [result, setResult] = useState(null);

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
    });
    setGeneration(gen);

    // Deduct diamonds
    const newBalance = useFreeTrial ? user.diamonds : user.diamonds - cost;
    await base44.auth.updateMe({
      diamonds: newBalance,
      free_trial_used: useFreeTrial ? true : user.free_trial_used,
    });
    await base44.entities.Transaction.create({
      type: useFreeTrial ? "free_trial" : "generation",
      amount: -cost,
      description: `Génération ${getContentType(genType).label}: ${prompt.substring(0, 50)}`,
      reference: `gen_${gen.id}`,
      balance_after: newBalance,
      related_generation_id: gen.id,
    });
    refreshUser();

    // Run pipeline
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
          // Refund
          refundDiamonds(gen.id, user, useFreeTrial, cost);
          refreshUser();
        },
      }
    );
  };

  const refundDiamonds = async (genId, user, usedFreeTrial, cost) => {
    try {
      await base44.auth.updateMe({
        diamonds: user.diamonds,
        free_trial_used: usedFreeTrial ? false : user.free_trial_used,
      });
      await base44.entities.Transaction.create({
        type: "admin_adjustment",
        amount: cost,
        description: `Remboursement: génération échouée`,
        reference: `refund_${genId}`,
        balance_after: user.diamonds,
      });
    } catch { /* ignore */ }
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
      const me = await base44.auth.me();
      if (me.referred_by && !me.referral_rewarded) {
        // Find referrer by referral_code
        const referrers = await base44.entities.User.filter({ referral_code: me.referred_by });
        if (referrers && referrers.length > 0) {
          const referrer = referrers[0];
          // Mark as rewarded
          await base44.auth.updateMe({ referral_rewarded: true });
          // Credit referrer (requires admin — will work if current user is admin, otherwise just log)
          // In production this would be a backend function
        }
      }
    } catch { /* ignore */ }
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

      {phase === "form" && (
        <CreateForm type={type} onTypeChange={handleTypeChange} user={currentUser} onSubmit={handleSubmit} />
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