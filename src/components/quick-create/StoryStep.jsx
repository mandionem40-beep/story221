import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Library, Search } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function StoryStep({ story, scenarios, savedCharacters, onChange, onNext, onBack }) {
  const [showCrossover, setShowCrossover] = useState(false);
  const update = (patch) => onChange({ ...story, ...patch });

  const list = scenarios.length > 0 ? scenarios : [];
  const canNext = story.scenario != null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Choisis l'histoire</h2>
          <p className="text-xs text-muted-foreground">Une aventure en un clic</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Scenario grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {list.map((s, i) => (
          <button
            key={s.id || i}
            onClick={() => { update({ scenario: s }); setShowCrossover(!!s.requires_second_character); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
              story.scenario?.title === s.title ? "bg-primary/10 border-primary/40 scale-[1.02]" : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <span className="text-3xl">{s.emoji}</span>
            <span className="text-xs font-medium text-white leading-tight">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Crossover */}
      {story.scenario && (
        <div className="mb-5 rounded-2xl bg-card border border-border p-4">
          <button
            onClick={() => setShowCrossover(!showCrossover)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white">Mode Crossover — Ajouter un second personnage</span>
            </div>
            <span className="text-xs text-muted-foreground">{story.secondCharacter ? story.secondCharacter.name : "Optionnel"}</span>
          </button>

          {showCrossover && (
            <div className="mt-3 pt-3 border-t border-border">
              {savedCharacters.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  <Library className="w-5 h-5 mx-auto mb-1 opacity-50" />
                  Pas encore de personnage sauvegardé. Créez-en un pour le réutiliser ici !
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {savedCharacters.map(c => (
                    <button
                      key={c.id}
                      onClick={() => update({ secondCharacter: story.secondCharacter?.id === c.id ? null : c })}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 w-16 p-2 rounded-xl border transition-all ${
                        story.secondCharacter?.id === c.id ? "bg-primary/10 border-primary/40" : "bg-secondary border-border"
                      }`}
                    >
                      {c.image_url ? (
                        <Image src={c.image_url} fittingType="fill" className="w-8 h-8 rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm">🎭</div>
                      )}
                      <span className="text-[9px] text-white text-center truncate w-full">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Optional detail */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Ajouter un détail <span className="text-muted-foreground/50">(optionnel)</span>
        </label>
        <input
          value={story.detail}
          onChange={e => update({ detail: e.target.value })}
          placeholder="Ex: dans un marché animé de Dakar..."
          maxLength={150}
          className="w-full h-11 rounded-xl bg-card border border-border px-4 text-sm text-white placeholder:text-muted-foreground/50"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 glow-red-sm"
      >
        Suivant <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}