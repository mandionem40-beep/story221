import { useState } from "react";
import { Star, Wrench, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { recordSatisfaction, recordCorrection, updateProfileAfterFeedback } from "@/lib/creative-memory";

const IMPROVEMENT_TAGS = ["Personnage", "Scénario", "Réalisme", "Voix", "Animation", "Caméra", "Décor", "Dialogue", "Cohérence", "Autre"];

const CORRECTION_REASONS = [
  { value: "character", label: "Personnage" },
  { value: "face", label: "Visage" },
  { value: "realism", label: "Réalisme" },
  { value: "voice", label: "Voix" },
  { value: "decor", label: "Décor" },
  { value: "style", label: "Style" },
  { value: "duration", label: "Durée" },
  { value: "dialogue", label: "Dialogue" },
  { value: "continuity", label: "Continuité" },
  { value: "other", label: "Autre" },
];

export default function CreativeFeedbackWidget({ generationId }) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState("");
  const [savingRating, setSavingRating] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [correctionDone, setCorrectionDone] = useState(false);

  if (!generationId) return null;

  const toggleTag = (tag) => setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const submitRating = async () => {
    setSavingRating(true);
    try {
      await recordSatisfaction({ generationId, rating, improvementTags: tags, comment });
      await updateProfileAfterFeedback({ rating, improvementTags: tags });
      setRatingDone(true);
      toast({ title: "Merci !", description: "Ton avis alimente la mémoire créative de Story221." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer ton avis.", variant: "destructive" });
    }
    setSavingRating(false);
  };

  const submitCorrection = async () => {
    setSavingCorrection(true);
    try {
      await recordCorrection({ generationId, reason, detail });
      setCorrectionDone(true);
      setCorrectionOpen(false);
      toast({ title: "Correction enregistrée", description: "Le studio IA en tiendra compte pour tes prochaines créations." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la correction.", variant: "destructive" });
    }
    setSavingCorrection(false);
  };

  return (
    <div className="mt-6 p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-white">Ta création te plaît ?</h3>
      </div>

      {ratingDone ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          Merci pour ton retour ({rating}/5) — l'IA apprend de tes préférences.
        </div>
      ) : (
        <>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className="p-1 -m-1 tap-highlight-none"
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
              >
                <Star className={`w-6 h-6 transition-colors ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="space-y-3 animate-in fade-in-50">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Que faut-il améliorer ? (optionnel)</p>
                <div className="flex flex-wrap gap-2">
                  {IMPROVEMENT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        tags.includes(tag) ? "bg-primary/20 border-primary text-white" : "bg-secondary border-border text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Un commentaire pour aider l'IA (optionnel)"
                rows={2}
                className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50"
              />
              <button
                onClick={submitRating}
                disabled={savingRating}
                className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {savingRating && <Loader2 className="w-4 h-4 animate-spin" />}
                Envoyer mon avis
              </button>
            </div>
          )}
        </>
      )}

      {/* Correction capture */}
      <div className="mt-4 pt-4 border-t border-border">
        {correctionDone ? (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 className="w-4 h-4" /> Correction enregistrée dans la mémoire créative.
          </div>
        ) : correctionOpen ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Qu'est-ce qui doit être corrigé ?</p>
            <div className="flex flex-wrap gap-2">
              {CORRECTION_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    reason === r.value ? "bg-primary/20 border-primary text-white" : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Décris ce que tu voulais vraiment (ex: le visage du personnage a changé)"
              rows={2}
              className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <div className="flex gap-2">
              <button
                onClick={submitCorrection}
                disabled={!reason || savingCorrection}
                className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {savingCorrection && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer la correction
              </button>
              <button
                onClick={() => setCorrectionOpen(false)}
                className="h-10 px-4 rounded-xl bg-secondary text-muted-foreground text-sm font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCorrectionOpen(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <Wrench className="w-4 h-4" /> Quelque chose à corriger sur cette vidéo ?
          </button>
        )}
      </div>
    </div>
  );
}