import CategoryVideoGrid from "@/components/quick-create/CategoryVideoGrid";
import { Dice5 } from "lucide-react";

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

      <CategoryVideoGrid showcases={showcases} onSelect={onSelect} />
    </div>
  );
}