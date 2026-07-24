import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import InfluencerCard from "@/components/influencer/InfluencerCard";
import InfluencerCreate from "@/components/influencer/InfluencerCreate";
import InfluencerDetail from "@/components/influencer/InfluencerDetail";
import { Plus, Sparkles, Loader2 } from "lucide-react";

export default function Influencers() {
  const { currentUser } = useOutletContext();
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const detailId = urlParams.get("id");

  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadInfluencers = async () => {
    try {
      const list = await base44.entities.Influencer.filter({ created_by_id: currentUser?.id }, "-created_date", 100);
      setInfluencers(list || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadInfluencers(); }, [currentUser]);

  if (detailId) {
    return <InfluencerDetail influencerId={detailId} onBack={() => { window.history.pushState({}, "", "/app/influencers"); loadInfluencers(); }} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-white">Influenceurs IA</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold glow-red-sm"
        >
          <Plus className="w-4 h-4" /> Créer
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Gérez vos personnages virtuels et leur contenu</p>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-white font-medium mb-1">Aucun influenceur</p>
          <p className="text-sm text-muted-foreground mb-4">Créez votre premier influenceur IA !</p>
          <button onClick={() => setShowCreate(true)} className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
            Créer un influenceur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {influencers.map(inf => (
            <InfluencerCard
              key={inf.id}
              influencer={inf}
              onClick={() => { window.history.pushState({}, "", `/app/influencers?id=${inf.id}`); window.dispatchEvent(new PopStateEvent("popstate")); }}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <InfluencerCreate
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadInfluencers(); }}
        />
      )}
    </div>
  );
}