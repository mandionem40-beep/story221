import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Scissors, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function MontageTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.MontagePreset.filter({ active: true }, "display_order", 50)
      .then(setPresets)
      .catch(() => toast({ title: "Erreur", description: "Impossible de charger les modèles.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const launchTemplate = (preset) => {
    navigate(`/app/editor?preset_id=${preset.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => navigate("/app")} className="p-2 -ml-2 text-muted-foreground hover:text-white mb-4">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-white">Modèles de montages</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Choisis un modèle, importe ta vidéo, l'IA monte tout. Aucune configuration manuelle.
      </p>

      {presets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Aucun modèle disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => launchTemplate(p)}
              className="group p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col"
            >
              <span className="text-3xl mb-2">{p.emoji}</span>
              <span className="text-sm font-bold text-white mb-1">{p.name}</span>
              <span className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">{p.description}</span>
              <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                <Scissors className="w-3.5 h-3.5" /> Lancer en 1 clic
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-2xl bg-secondary/40 border border-border flex items-start gap-3">
        <Wand2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Chaque modèle pré-remplit automatiquement le style de montage. Tu n'as plus qu'à importer ta vidéo et lancer la génération — le prompt est déjà optimisé pour le rendu choisi.
        </p>
      </div>
    </div>
  );
}