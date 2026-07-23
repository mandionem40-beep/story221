import { useState, useEffect } from "react";
import { Star, Loader2, CheckCircle, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const ratingLabels = [
  { key: "app_rating", label: "Application globale" },
  { key: "video_quality_rating", label: "Qualité des vidéos" },
  { key: "speed_rating", label: "Rapidité" },
  { key: "ux_rating", label: "Expérience utilisateur" },
];

export default function FeedbackWidget({ userId }) {
  const [ratings, setRatings] = useState({ app_rating: 0, video_quality_rating: 0, speed_rating: 0, ux_rating: 0 });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previous, setPrevious] = useState(null);
  const [hover, setHover] = useState({});

  useEffect(() => {
    if (!userId) return;
    base44.entities.Feedback.filter({ created_by_id: userId }, "-created_date", 1)
      .then((res) => { if (res?.length) { setPrevious(res[0]); } })
      .catch(() => {});
  }, [userId]);

  const handleSubmit = async () => {
    if (ratings.app_rating === 0) {
      toast({ title: "Note requise", description: "Veuillez au moins noter l'application.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        ...ratings,
        comment: comment.trim(),
      });
      setSubmitted(true);
      toast({ title: "Merci !", description: "Votre avis a bien été envoyé." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer l'avis.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Avis envoyé !</h3>
        <p className="text-sm text-muted-foreground mb-4">Merci pour votre retour. L'équipe Story221 en prend bonne note.</p>
        <button
          onClick={() => { setSubmitted(false); setRatings({ app_rating: 0, video_quality_rating: 0, speed_rating: 0, ux_rating: 0 }); setComment(""); }}
          className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium"
        >
          Donner un nouvel avis
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-white">Donner votre avis</h3>
      </div>

      <div className="space-y-4 mb-4">
        {ratingLabels.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatings({ ...ratings, [key]: star })}
                  onMouseEnter={() => setHover({ ...hover, [key]: star })}
                  onMouseLeave={() => setHover({ ...hover, [key]: 0 })}
                  className="p-0.5"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      star <= (hover[key] || ratings[key])
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ajoutez un commentaire détaillé (optionnel)..."
        rows={4}
        className="w-full rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none resize-none mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
        Envoyer mon avis
      </button>

      {previous && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Votre dernier avis :</p>
          <div className="flex gap-2 flex-wrap">
            {ratingLabels.map(({ key, label }) => (
              <span key={key} className="text-xs text-muted-foreground">
                {label.split(" ")[0]}: {previous[key] || 0}/5
              </span>
            ))}
          </div>
          {previous.comment && <p className="text-sm text-white mt-2 italic">"{previous.comment}"</p>}
        </div>
      )}
    </div>
  );
}