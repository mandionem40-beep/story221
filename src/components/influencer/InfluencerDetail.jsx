import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import TopicSuggestions from "@/components/influencer/TopicSuggestions";
import CreateInfluencerContent from "@/components/influencer/CreateInfluencerContent";
import { ChevronLeft, Plus, Users, Eye, Heart, Video, Calendar, Clock, Play, Sparkles, Loader2 } from "lucide-react";

export default function InfluencerDetail({ influencerId, onBack }) {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  const [influencer, setInfluencer] = useState(null);
  const [reels, setReels] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = async () => {
    try {
      const inf = await base44.entities.Influencer.get(influencerId);
      setInfluencer(inf);
      const [rs, scs] = await Promise.all([
        base44.entities.Reel.filter({ influencer_id: influencerId }, "-created_date", 50),
        base44.entities.InfluencerSchedule.filter({ influencer_id: influencerId }, "-scheduled_date", 20),
      ]);
      setReels(rs || []);
      setSchedules(scs || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [influencerId]);

  const totalViews = reels.reduce((s, r) => s + (r.views || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  if (!influencer) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Influenceur introuvable</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-4">
        <ChevronLeft className="w-4 h-4" /> Mes influenceurs
      </button>

      {/* Profile header */}
      <div className="rounded-2xl bg-card border border-border p-5 mb-5">
        <div className="flex items-center gap-4 mb-4">
          {influencer.avatar_url ? (
            <Image src={influencer.avatar_url} fittingType="fill" className="w-16 h-16 rounded-2xl" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {influencer.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{influencer.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium">🤖 IA</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{influencer.bio || "Influenceur IA"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Abonnés", value: influencer.follower_count || 0, icon: Users },
            { label: "Contenus", value: reels.length, icon: Video },
            { label: "Vues", value: totalViews, icon: Eye },
            { label: "Likes", value: influencer.total_likes || 0, icon: Heart },
          ].map(s => (
            <div key={s.label} className="text-center rounded-xl bg-secondary p-2">
              <s.icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-0.5" />
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Themes */}
        {influencer.content_themes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {influencer.content_themes.map(t => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Create content button */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-full mb-5 py-3 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 glow-red-sm"
      >
        <Plus className="w-5 h-5" /> Créer du contenu
      </button>

      {/* Topic suggestions */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-5">
        <TopicSuggestions influencer={influencer} onSelectTopic={(title, desc) => { setShowCreate(true); }} />
      </div>

      {/* Scheduled posts */}
      {schedules.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Publications planifiées</h3>
          <div className="space-y-2">
            {schedules.filter(s => s.status === "pending").map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
                <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.topic}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(s.scheduled_date).toLocaleString("fr-FR")}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-[10px] text-yellow-400">En attente</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent content */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5"><Video className="w-4 h-4" /> Contenus publiés</h3>
        {reels.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-8 text-center">
            <Sparkles className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun contenu pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {reels.map(r => (
              <div key={r.id} className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="aspect-square bg-secondary">
                  {r.thumbnail_url ? <Image src={r.thumbnail_url} fittingType="fill" className="w-full h-full" /> :
                   r.video_url ? <video src={r.video_url} className="w-full h-full object-cover" muted /> :
                   <div className="w-full h-full flex items-center justify-center"><Play className="w-5 h-5 text-muted-foreground" /></div>}
                </div>
                <div className="p-1.5">
                  <p className="text-[10px] font-medium text-white truncate">{r.title}</p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{r.views || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create content modal */}
      {showCreate && (
        <CreateInfluencerContent
          influencer={influencer}
          onClose={() => setShowCreate(false)}
          onPublished={() => { setShowCreate(false); loadData(); }}
        />
      )}
    </div>
  );
}