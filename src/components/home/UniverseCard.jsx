import { Sparkles, MessageCircle, Zap, Star } from "lucide-react";

export default function UniverseCard({ category, onChat, onQuickCreate }) {
  const isRedirect = !!category.redirect;

  return (
    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 group">
      {category.video_url ? (
        <video
          src={category.video_url}
          poster={category.image}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
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

      <div className="absolute bottom-0 left-0 right-0 p-3 pb-2.5">
        <h3 className="text-sm font-bold text-white leading-tight">{category.emoji} {category.label}</h3>
        <p className="text-[10px] text-white/70 line-clamp-2 leading-snug mt-0.5 mb-2">{category.desc}</p>

        <div className="flex gap-1.5">
          {isRedirect ? (
            <button
              onClick={() => onQuickCreate(category)}
              className="flex-1 h-8 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
            >
              <Star className="w-3 h-3" /> Gérer
            </button>
          ) : (
            <>
              <button
                onClick={() => onChat(category)}
                className="flex-1 h-8 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-white/25 transition-colors"
              >
                <MessageCircle className="w-3 h-3" /> Chat
              </button>
              <button
                onClick={() => onQuickCreate(category)}
                className="flex-1 h-8 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-3 h-3" /> Rapide
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}