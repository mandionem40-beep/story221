import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Upload, Scissors, Send, Loader2, ChevronLeft, Wand2, Play } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { useToast } from "@/components/ui/use-toast";

const defaultPresets = [
  { id: "dynamic", name: "Dynamique Créateur", emoji: "🎬", description: "Rythme rapide, coupes franches, zooms punchy, sous-titres animés mot par mot" },
  { id: "cinematic", name: "Cinématique", emoji: "🎥", description: "Coupes lentes, fondus, étalonnage chaud, musique orchestrale" },
  { id: "social", name: "Réseaux sociaux", emoji: "📱", description: "Format vertical, hooks visuels dès les 3 premières secondes, texte percutant" },
  { id: "interview", name: "Interview/Podcast", emoji: "🎙️", description: "Recadrage auto sur le visage qui parle, bandeau nom/titre" },
];

const MONTAGE_COST = 15;
const ADJUSTMENT_COST = 5;

export default function VideoEditor() {
  const { currentUser, refreshUser } = useOutletContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [presets, setPresets] = useState(defaultPresets);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("form");
  const [result, setResult] = useState(null);
  const [adjustmentPrompt, setAdjustmentPrompt] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    base44.entities.MontagePreset.filter({ active: true }, "display_order", 10)
      .then(dbPresets => { if (dbPresets.length > 0) setPresets(dbPresets); })
      .catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Maximum 100 MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setVideoUrl(res.file_url);
    } catch {
      toast({ title: "Erreur", description: "Upload échoué", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleGenerate = async () => {
    if (!videoUrl || !prompt.trim()) return;
    const user = await base44.auth.me();
    if (user.diamonds < MONTAGE_COST) {
      toast({ title: "Solde insuffisant", description: "Achetez des diamants pour continuer.", variant: "destructive" });
      navigate("/app/diamonds");
      return;
    }

    setPhase("processing");
    try {
      const m = await base44.entities.Montage.create({
        source_video_url: videoUrl,
        preset_id: selectedPreset?.id || "",
        preset_name: selectedPreset?.name || "",
        prompt: prompt.trim(),
        status: "pending",
        cost_diamonds: MONTAGE_COST,
        duration_minutes: 1,
      });

      const response = await base44.functions.invoke("auto-edit-video", { montageId: m.id });
      setResult({ ...response.data, montage_id: m.id });
      setPhase("result");
      refreshUser();
    } catch (error) {
      toast({ title: "Montage échoué", description: error.response?.data?.error || error.message, variant: "destructive" });
      setPhase("form");
      refreshUser();
    }
  };

  const handleAdjust = async () => {
    if (!adjustmentPrompt.trim() || !result?.montage_id) return;
    const user = await base44.auth.me();
    if (user.diamonds < ADJUSTMENT_COST) {
      toast({ title: "Solde insuffisant", description: "Achetez des diamants pour continuer.", variant: "destructive" });
      navigate("/app/diamonds");
      return;
    }

    setAdjusting(true);
    try {
      const adj = await base44.entities.MontageAdjustment.create({
        montage_id: result.montage_id,
        prompt: adjustmentPrompt.trim(),
        status: "pending",
        cost_diamonds: ADJUSTMENT_COST,
      });

      const response = await base44.functions.invoke("auto-edit-video", {
        montageId: result.montage_id,
        adjustmentId: adj.id,
        adjustmentPrompt: adjustmentPrompt.trim(),
      });

      if (response.data?.result_url) {
        setResult({ ...result, result_url: response.data.result_url });
      }
      setAdjustmentPrompt("");
      refreshUser();
      toast({ title: "Ajustement appliqué !" });
    } catch (error) {
      toast({ title: "Ajustement échoué", description: error.response?.data?.error || error.message, variant: "destructive" });
    }
    setAdjusting(false);
  };

  if (phase === "processing") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Montage en cours...</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Claude analyse votre vidéo, planifie le montage et génère le résultat.
          </p>
          <Loader2 className="w-6 h-6 text-primary animate-spin mt-4" />
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setPhase("form")} className="p-2 -ml-2 text-muted-foreground hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">🎬 Vidéo montée</h2>

        {result.result_url && (
          <div className="rounded-2xl overflow-hidden bg-black mb-4">
            <video src={result.result_url} controls className="w-full" />
          </div>
        )}

        {result.montage_plan && (
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">Plan de montage</h3>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{result.montage_plan}</p>
          </div>
        )}

        {/* Adjustment section */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" /> Ajustements ciblés
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Demande un ajustement en langage naturel (moins cher qu'un montage complet).
          </p>
          <textarea
            value={adjustmentPrompt}
            onChange={e => setAdjustmentPrompt(e.target.value)}
            placeholder="ex: enlève le zoom à 12 secondes, mets une transition plus douce..."
            className="w-full min-h-[80px] bg-secondary border border-border rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40 mb-3"
          />
          <button
            onClick={handleAdjust}
            disabled={!adjustmentPrompt.trim() || adjusting}
            className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ajuster ({ADJUSTMENT_COST} <DiamondIcon className="w-4 h-4" />)
          </button>
        </div>

        <button
          onClick={() => { setPhase("form"); setResult(null); setVideoUrl(""); setPrompt(""); setSelectedPreset(null); }}
          className="w-full mt-4 h-11 rounded-xl bg-secondary border border-border text-white font-semibold hover:bg-secondary/80 transition-colors"
        >
          Nouveau montage
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => navigate("/app")} className="p-2 -ml-2 text-muted-foreground hover:text-white mb-4">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h1 className="text-2xl font-bold text-white mb-1">🎬 Montage Automatique</h1>
      <p className="text-sm text-muted-foreground mb-6">Importe ta vidéo, décris le style, l'IA monte tout.</p>

      {/* Upload */}
      <div className="mb-5">
        {videoUrl ? (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video src={videoUrl} controls className="w-full max-h-64" />
            <button
              onClick={() => setVideoUrl("")}
              className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-black/70 text-white text-xs font-medium"
            >
              Changer
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 h-40 rounded-2xl border-2 border-dashed border-border cursor-pointer hover:border-primary/40 transition-colors">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload ta vidéo (mp4, mov)</span>
                <span className="text-xs text-muted-foreground/50">Max 100 MB</span>
              </>
            )}
            <input type="file" accept="video/mp4,video/quicktime" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Presets */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Preset de style</label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPreset?.id === p.id ? "bg-primary/10 border-primary/40" : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <span className="text-lg block mb-1">{p.emoji}</span>
              <span className="text-sm font-semibold text-white block">{p.name}</span>
              <span className="text-[10px] text-muted-foreground line-clamp-2">{p.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Style demandé</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Monte-moi ça dans un style dynamique, rythmé, avec des zooms sur les moments forts et des sous-titres animés."
          className="w-full min-h-[80px] bg-card border border-border rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40"
        />
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!videoUrl || !prompt.trim()}
        className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-red-sm"
      >
        <Play className="w-4 h-4" />
        Monter ({MONTAGE_COST} <DiamondIcon className="w-4 h-4" />)
      </button>
    </div>
  );
}