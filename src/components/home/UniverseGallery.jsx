import { characterCategories } from "@/lib/quick-create-data";
import UniverseCard from "./UniverseCard";

export default function UniverseGallery({ selectedId, onSelect }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-1">🎬 Galerie d'univers</h2>
      <p className="text-sm text-muted-foreground mb-4">Choisis un style, puis écris ton histoire dans le chat ci-dessus.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {characterCategories.map(cat => (
          <UniverseCard
            key={cat.id}
            category={cat}
            selected={selectedId === cat.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}