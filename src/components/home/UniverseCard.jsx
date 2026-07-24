import { Sparkles } from "lucide-react";
import AutoVideo from "@/components/ui/auto-video";

export default function UniverseCard({ category, selected, onSelect }) {
  const isRedirect = !!category.redirect;

  return (
    <button
      onClick={() => onSelect(category)}
      className={`relative aspect-[9/16] rounded-2xl overflow-hidden bg-card border-2 transition-all duration-300 group text-left ${
        selected
          ? "border-primary glow-red-sm scale-[1.02]"
          : "border-border hover:border-primary/50"
      }`}
    >
      {category.video_url ? (
        <AutoVideo
          src={category.video_url}
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <img
          src={category.image}
          alt={category.label}
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          loading="lazy"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

      {category.isNew && (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 text-white text-[10px] font-semibold flex items-center gap-1 z-10">
          <Sparkles className="w-2.5 h-2.5" /> Nouveau
        </span>
      )}

      {/* Selection checkmark */}
      {selected && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 pb-2.5">
        <h3 className="text-sm font-bold text-white leading-tight">{category.emoji} {category.label}</h3>
        <p className="text-[10px] text-white/70 line-clamp-2 leading-snug mt-0.5">{category.desc}</p>
      </div>
    </button>
  );
}