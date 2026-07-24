import { characterCategories } from "@/lib/quick-create-data";
import { Dice5 } from "lucide-react";

export default function CharacterTypeStep({ onSelect, onSurprise }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Choisis ton personnage</h2>
        <p className="text-sm text-muted-foreground">Sélectionne une catégorie pour commencer</p>
      </div>

      <button
        onClick={onSurprise}
        className="w-full mb-5 py-3 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors glow-red-sm"
      >
        <Dice5 className="w-5 h-5" />
        Surprends-moi !
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {characterCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">{cat.emoji}</div>
            <span className="text-sm font-medium text-white">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}