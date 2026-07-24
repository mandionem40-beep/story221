import { ChevronLeft, Sparkles } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { characterCategories } from "@/lib/quick-create-data";

export default function SummaryStep({ character, story, settings, cost, onGenerate, onBack, generating }) {
  const cat = characterCategories.find(c => c.id === character.category);

  const RecapItem = ({ label, value }) => (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm text-white font-medium truncate">{value}</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">C'est prêt !</h2>
          <p className="text-xs text-muted-foreground">Vérifie tout et lance la magie</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Character recap card */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl">
            {character.appearance?.emoji || cat?.emoji}
          </div>
          <div>
            <p className="text-base font-bold text-white">{character.name || "Sans nom"}</p>
            <p className="text-xs text-muted-foreground">{cat?.label} · {character.appearance?.label}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <RecapItem label="Couleur" value={character.color?.label || "—"} />
          <RecapItem label="Style" value={character.visualStyle?.label || "—"} />
          {character.traits.length > 0 && <RecapItem label="Traits" value={character.traits.join(", ")} />}
        </div>
      </div>

      {/* Story recap */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{story.scenario?.emoji}</span>
          <p className="text-sm font-bold text-white">{story.scenario?.title || "—"}</p>
        </div>
        {story.secondCharacter && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-primary/10">
            <span className="text-sm">🎭</span>
            <span className="text-xs text-white">Crossover avec <b>{story.secondCharacter.name}</b></span>
          </div>
        )}
        {story.detail && <p className="text-xs text-muted-foreground mt-2">💬 {story.detail}</p>}
      </div>

      {/* Settings recap */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-5">
        <div className="grid grid-cols-2 gap-1.5">
          <RecapItem label="Durée" value={settings.duration.label} />
          <RecapItem label="Langue" value={settings.language} />
          <RecapItem label="Voix" value={settings.voice} />
          <RecapItem label="Musique" value={settings.music} />
          <RecapItem label="Format" value={settings.format} />
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={generating}
        className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 glow-red animate-pulse-glow"
      >
        {generating ? (
          <Sparkles className="w-5 h-5 animate-pulse" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Créer ma vidéo
            <span className="flex items-center gap-1 ml-1">
              <DiamondIcon className="w-4 h-4" />
              {cost}
            </span>
          </>
        )}
      </button>
    </div>
  );
}