import { characterCategories, colors, visualStyles, personalityTraits } from "@/lib/quick-create-data";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function BuildCharacterStep({ character, onChange, onNext, onBack }) {
  const cat = characterCategories.find(c => c.id === character.category);
  if (!cat) return null;

  const update = (patch) => onChange({ ...character, ...patch });

  const cycleAppearance = () => {
    const idx = Math.floor(Math.random() * cat.appearances.length);
    update({ appearance: cat.appearances[idx] });
  };

  const toggleTrait = (trait) => {
    const has = character.traits.includes(trait);
    update({ traits: has ? character.traits.filter(t => t !== trait) : [...character.traits, trait] });
  };

  const canNext = character.name.trim().length > 0 && character.appearance && character.color && character.visualStyle;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Construis ton {cat.label.toLowerCase()}</h2>
          <p className="text-xs text-muted-foreground">Tout se choisit en un clic</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apparence</label>
          <button onClick={cycleAppearance} className="flex items-center gap-1 text-xs text-primary font-medium">
            <RefreshCw className="w-3 h-3" /> Autre proposition
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {cat.appearances.map(a => (
            <button
              key={a.label}
              onClick={() => update({ appearance: a })}
              className={`flex-shrink-0 flex flex-col items-center gap-1 w-20 p-3 rounded-xl border transition-all ${
                character.appearance?.label === a.label ? "bg-primary/10 border-primary/40 scale-105" : "bg-card border-border"
              }`}
            >
              <span className="text-3xl">{a.emoji}</span>
              <span className="text-[10px] text-white text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Couleur dominante</label>
        <div className="flex flex-wrap gap-2">
          {colors.map(c => (
            <button
              key={c.id}
              onClick={() => update({ color: c })}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                character.color?.id === c.id ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>
        {character.color && <p className="text-xs text-muted-foreground mt-1.5">{character.color.label}</p>}
      </div>

      {/* Visual style */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Style visuel</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visualStyles.map(s => (
            <button
              key={s.id}
              onClick={() => update({ visualStyle: s })}
              className={`p-3 rounded-xl border text-left transition-all ${
                character.visualStyle?.id === s.id ? "bg-primary/10 border-primary/40" : "bg-card border-border"
              }`}
            >
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Personality traits */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Traits de personnalité <span className="text-muted-foreground/50">(plusieurs possibles)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {personalityTraits.map(t => (
            <button
              key={t}
              onClick={() => toggleTrait(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                character.traits.includes(t) ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nom du personnage</label>
        <input
          value={character.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="Ex: Mandione"
          maxLength={30}
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