import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Globe, Send, Loader2, ChevronLeft, ShieldCheck, AlertTriangle, Play } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { useToast } from "@/components/ui/use-toast";

const DEMO_COST = 10;

export default function DemoGenerator() {
  const { currentUser, refreshUser } = useOutletContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [url, setUrl] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("form");
  const [result, setResult] = useState(null);
  const [blocked, setBlocked] = useState(false);

  const handleGenerate = async () => {
    if (!url.trim() || !rightsConfirmed) return;

    let urlFormatted = url.trim();
    if (!urlFormatted.startsWith("http")) urlFormatted = "https://" + urlFormatted;

    setPhase("processing");
    setBlocked(false);
    try {
      const demo = await base44.entities.PlatformDemo.create({
        url: urlFormatted,
        rights_confirmed: true,
        confirmed_at: new Date().toISOString(),
        prompt: prompt.trim(),
        status: "pending",
        cost_diamonds: DEMO_COST,
        duration_minutes: 1,
      });

      const response = await base44.functions.invoke("generate-demo-video", { demoId: demo.id });

      if (response.data?.blocked) {
        setBlocked(true);
        setPhase("form");
        toast({
          title: "Domaine bloqué",
          description: "Ce site appartient à une catégorie sensible (banque, administration, paiement, santé).",
          variant: "destructive"
        });
        return;
      }

      setResult(response.data);
      setPhase("result");
      refreshUser();
    } catch (error) {
      toast({ title: "Génération échouée", description: error.response?.data?.error || error.message, variant: "destructive" });
      setPhase("form");
      refreshUser();
    }
  };

  if (phase === "processing") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Génération de la démo...</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Navigation sur le site, analyse des sections, création du script, voix off et assemblage vidéo.
          </p>
          <Loader2 className="w-6 h-6 text-primary animate-spin mt-4" />
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => { setPhase("form"); setResult(null); setUrl(""); setPrompt(""); }} className="p-2 -ml-2 text-muted-foreground hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">🌐 Vidéo démo prête</h2>

        {result.result_url && (
          <div className="rounded-2xl overflow-hidden bg-black mb-4">
            <video src={result.result_url} controls className="w-full" />
          </div>
        )}

        {result.voice_url && (
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">🎙️ Voix off</h3>
            <audio src={result.voice_url} controls className="w-full" />
          </div>
        )}

        {result.script && (
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">Script</h3>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{result.script}</p>
          </div>
        )}

        <button
          onClick={() => { setPhase("form"); setResult(null); setUrl(""); setPrompt(""); }}
          className="w-full h-11 rounded-xl bg-secondary border border-border text-white font-semibold hover:bg-secondary/80 transition-colors"
        >
          Nouvelle démo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => navigate("/app")} className="p-2 -ml-2 text-muted-foreground hover:text-white mb-4">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h1 className="text-2xl font-bold text-white mb-1">🌐 Générateur de Vidéo Démo</h1>
      <p className="text-sm text-muted-foreground mb-6">Colle un lien, obtiens une vidéo démo professionnelle du site.</p>

      {/* URL input */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">URL du site</label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://story221.com"
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-white placeholder:text-muted-foreground/50 outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Rights confirmation */}
      <button
        onClick={() => setRightsConfirmed(!rightsConfirmed)}
        className={`w-full p-3 rounded-xl border flex items-start gap-3 text-left mb-5 transition-all ${
          rightsConfirmed ? "bg-primary/10 border-primary/40" : "bg-card border-border"
        }`}
      >
        <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${rightsConfirmed ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs text-white leading-relaxed">
          Je certifie être propriétaire de ce site, ou disposer de l'autorisation de son propriétaire pour en créer une vidéo de démonstration.
        </span>
      </button>

      {/* Optional prompt */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Personnalisation (optionnel)</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Mets l'accent sur la page tarifs et le tableau de bord, ton dynamique et professionnel."
          className="w-full min-h-[70px] bg-card border border-border rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40"
        />
      </div>

      {/* Warning */}
      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 mb-5 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Les sites de banques, administrations, paiement et santé sont automatiquement bloqués.
        </p>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!url.trim() || !rightsConfirmed}
        className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-red-sm"
      >
        <Play className="w-4 h-4" />
        Générer la démo ({DEMO_COST} <DiamondIcon className="w-4 h-4" />)
      </button>
    </div>
  );
}