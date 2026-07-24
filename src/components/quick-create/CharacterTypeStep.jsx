import { characterCategories } from "@/lib/quick-create-data";
import { Dice5, Sparkles } from "lucide-react";

export default function CharacterTypeStep({ onSelect, onSurprise }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Choisis ton personnage</h2>
        <p className="text-sm text-muted-foreground">Sélectionne une catégorie pour commencer</p>
      </div>

      <button
        onClick={onSurprise}
        className="w-full mb-5 py-3.5 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors glow-red-sm"
      >
        <Dice5 className="w-5 h-5" />
        Surprends-moi !
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {characterCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className="group flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/[0.03] transition-all text-left"
          >
            <div className="flex-1 min-w-0">
              {cat.isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold mb-1.5">
                  {cat.isNew && <Sparkles className="w-2.5 h-2.5" />} Nouveau
                </span>
              )}
              <h3 className="text-base font-bold text-white mb-0.5 leading-tight">{cat.label}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{cat.desc}</p>
            </div>
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-secondary group-hover:scale-105 transition-transform">
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}