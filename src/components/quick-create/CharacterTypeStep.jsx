import { characterCategories } from "@/lib/quick-create-data";
import { Dice5, Sparkles, Play } from "lucide-react";

export default function CharacterTypeStep({ onSelect, onSurprise, showcases = [] }) {
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {characterCategories.map((cat, i) => {
          const showcase = showcases[i];
          const imageUrl = showcase?.thumbnail_url || cat.image;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 group hover:glow-red-sm"
            >
              <img
                src={imageUrl}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {cat.isNew && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 text-white text-[10px] font-semibold flex items-center gap-1 z-10">
                  <Sparkles className="w-2.5 h-2.5" /> Nouveau
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <h3 className="text-sm font-bold text-white leading-tight">{cat.label}</h3>
                <p className="text-[10px] text-white/70 line-clamp-2 leading-snug mt-0.5">{cat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}