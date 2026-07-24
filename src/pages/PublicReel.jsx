import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Sparkles, Eye, Share2, ArrowLeft, Play } from "lucide-react";

export default function PublicReel() {
  const urlParams = new URLSearchParams(window.location.search);
  const reelId = urlParams.get("id");
  const [reel, setReel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reelId) { setLoading(false); return; }
    base44.entities.Reel.get(reelId)
      .then(r => { setReel(r); if (r) base44.entities.Reel.update(r.id, { views: (r.views || 0) + 1 }).catch(() => {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reelId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><Sparkles className="w-6 h-6 text-primary animate-pulse" /></div>;
  }

  if (!reel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
        <p className="text-white font-medium mb-2">Vidéo introuvable</p>
        <Link to="/" className="text-primary text-sm">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Top bar */}
      <div className="w-full max-w-md flex items-center justify-between px-4 py-3 border-b border-border">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Story221
        </Link>
        <Link to="/register" className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold">S'inscrire</Link>
      </div>

      {/* Video */}
      <div className="w-full max-w-md flex-1 flex items-center justify-center bg-black relative">
        {reel.video_url ? (
          <video src={reel.video_url} controls autoPlay loop playsInline className="w-full h-full object-contain max-h-[70vh]" />
        ) : reel.thumbnail_url ? (
          <Image src={reel.thumbnail_url} fittingType="fill" className="w-full h-full max-h-[70vh]" />
        ) : (
          <div className="flex items-center justify-center h-full"><Play className="w-12 h-12 text-muted-foreground" /></div>
        )}

        {/* Author + title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            {reel.author_avatar ? (
              <img src={reel.author_avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-primary" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary">
                {(reel.author_name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-sm font-semibold text-white">@{reel.author_name || "createur"}</p>
          </div>
          <p className="text-sm text-white line-clamp-2">{reel.title}</p>
          <p className="text-xs text-white/50 mt-1 flex items-center gap-1"><Eye className="w-3 h-3" />{reel.views || 0} vues · <Share2 className="w-3 h-3" />{reel.share_count || 0} partages</p>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-md p-5 bg-card border-t border-border text-center">
        <p className="text-white font-semibold mb-1">Créez vos propres vidéos IA</p>
        <p className="text-xs text-muted-foreground mb-3">Rejoignez Story221 et créez du contenu viral avec l'IA.</p>
        <div className="flex gap-2">
          <Link to="/register" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">S'inscrire gratuitement</Link>
          <Link to="/login" className="flex-1 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}