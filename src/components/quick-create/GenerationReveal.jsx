import { Sparkles } from "lucide-react";

const revealSteps = [
  { id: "script", label: "Claude écrit le scénario...", emoji: "✍️" },
  { id: "characters", label: "Les personnages prennent vie...", emoji: "🎨" },
  { id: "scenes", label: "Les scènes se dessinent...", emoji: "🎬" },
  { id: "dialogues", label: "Les dialogues s'écrivent...", emoji: "💬" },
  { id: "voice", label: "La voix est enregistrée...", emoji: "🎙️" },
  { id: "video", label: "La vidéo se génère...", emoji: "🎥" },
  { id: "subtitles", label: "Les sous-titres sont ajoutés...", emoji: "📝" },
  { id: "final", label: "Montage final...", emoji: "🎞️" },
];

export default function GenerationReveal({ currentStep, error }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-lg font-bold text-white mb-1">Oups, ça n'a pas marché</h2>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">{error.message || "Une erreur est survenue. Vos diamants ont été remboursés."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Animated emoji */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-glow" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center animate-float">
          <span className="text-5xl">{revealSteps[currentStep]?.emoji || "✨"}</span>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-1 text-center">{revealSteps[currentStep]?.label || "Génération en cours..."}</h2>
      <p className="text-sm text-muted-foreground text-center mb-8">Patiente, la magie opère ✨</p>

      {/* Step dots */}
      <div className="flex items-center gap-2 flex-wrap justify-center max-w-xs">
        {revealSteps.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-1 transition-all ${
              i < currentStep ? "opacity-100" : i === currentStep ? "opacity-100 scale-110" : "opacity-30"
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              i < currentStep ? "bg-green-500/20 text-green-400" : i === currentStep ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            }`}>
              {i < currentStep ? "✓" : s.emoji}
            </div>
            {i < revealSteps.length - 1 && <div className={`w-3 h-0.5 ${i < currentStep ? "bg-green-500/40" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3 animate-pulse text-primary" />
        Étape {currentStep + 1} sur {revealSteps.length}
      </div>
    </div>
  );
}