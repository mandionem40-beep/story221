import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { Sparkles, Gift } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import UniverseGallery from "@/components/home/UniverseGallery";
import ChatPersonalize from "@/components/home/ChatPersonalize";

export default function Home() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();
  const [chatCategory, setChatCategory] = useState(null);
  const [recentGens, setRecentGens] = useState([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const gens = await base44.entities.Generation.filter(
          { created_by_id: currentUser?.id },
          "-created_date",
          4
        );
        setRecentGens(gens || []);
      } catch { /* empty state is fine */ }
    };
    loadRecent();
  }, [currentUser]);

  const diamonds = currentUser?.diamonds ?? 0;
  const freeTrialAvailable = !currentUser?.free_trial_used;

  const handleChat = (category) => setChatCategory(category);
  const handleQuickCreate = (category) => {
    if (category.redirect) {
      navigate(category.redirect);
    } else {
      navigate(`/app/quick-create?category=${category.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Bonjour, <span className="gradient-text-red">{currentUser?.username || currentUser?.full_name || "créateur"}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Choisis un univers, personnalise-le, et crée en quelques secondes.</p>
      </div>

      {/* Balance badges */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
          <DiamondIcon className="w-4 h-4" />
          <span className="text-sm font-semibold text-white">{diamonds}</span>
        </div>
        {freeTrialAvailable && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Essai gratuit (1 min)</span>
          </div>
        )}
      </div>

      {/* Universe Gallery */}
      <UniverseGallery onChat={handleChat} onQuickCreate={handleQuickCreate} />

      {/* Recent creations */}
      {recentGens.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Créations récentes</h3>
            <Link to="/app/library" className="text-sm text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentGens.map(gen => (
              <Link
                key={gen.id}
                to="/app/library"
                className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                {gen.result_url ? (
                  <div className="aspect-video bg-secondary">
                    <Image src={gen.result_url} fittingType="fill" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-white truncate">{gen.title || gen.prompt?.substring(0, 30)}</p>
                  <p className="text-[10px] text-muted-foreground">{gen.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Chat Personalize Modal */}
      {chatCategory && (
        <ChatPersonalize
          category={chatCategory}
          currentUser={currentUser}
          onClose={() => setChatCategory(null)}
        />
      )}
    </div>
  );
}