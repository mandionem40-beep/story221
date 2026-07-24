import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { Sparkles, Gift, Zap } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import UniverseGallery from "@/components/home/UniverseGallery";
import ChatCreation from "@/components/home/ChatCreation";
import QuickAccess from "@/components/home/QuickAccess";
import { characterCategories } from "@/lib/quick-create-data";

export default function Home() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
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
      } catch {/* empty state is fine */}
    };
    loadRecent();
  }, [currentUser]);

  const diamonds = currentUser?.diamonds ?? 0;
  const freeTrialAvailable = !currentUser?.free_trial_used;

  const handleSelectCategory = (cat) => {
    if (cat.redirect) {
      navigate(cat.redirect);
    } else {
      setSelectedCategory(cat);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
            Bonjour, <span className="gradient-text-red">{currentUser?.username || currentUser?.full_name || "créateur"}</span> 👋
          </h1>
        </div>
        <button
          onClick={() => navigate("/app/profile")}
          className="relative flex-shrink-0 group"
          aria-label="Voir mon profil"
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 blur-md animate-pulse-glow" />
          <span className="relative block w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-primary ring-2 ring-primary/20 bg-card group-hover:scale-110 transition-transform duration-300">
            {currentUser?.avatar_url || currentUser?.image_url ? (
              <img
                src={currentUser.avatar_url || currentUser.image_url}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/30 to-secondary text-white text-base font-bold uppercase">
                {(currentUser?.username || currentUser?.full_name || "U").charAt(0)}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Balance badges */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => navigate("/app/diamonds")}
          className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-card to-secondary border border-primary/30 hover:border-primary/60 transition-all duration-300 hover:scale-105 group overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <DiamondIcon className="w-4 h-4 relative animate-float" />
          <span className="text-sm font-semibold text-white relative">{diamonds}</span>
          <span className="text-[10px] text-muted-foreground relative hidden sm:inline">Diamants</span>
        </button>
        {freeTrialAvailable &&
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Essai gratuit (1 min)</span>
          </div>
        }
      </div>

      {/* Chat Creation Zone */}
      <div className="mb-6">
        <ChatCreation selectedCategory={selectedCategory} currentUser={currentUser} />
      </div>

      {/* Quick Access Shortcuts — after chat */}
      <QuickAccess />

      {/* Universe Gallery */}
      <UniverseGallery
        selectedId={selectedCategory?.id}
        onSelect={handleSelectCategory} />
      



      {/* Recent creations */}
      {recentGens.length > 0 &&
      <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Créations récentes</h3>
            <Link to="/app/library" className="text-sm text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentGens.map((gen) =>
          <Link
            key={gen.id}
            to="/app/library"
            className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors">
            
                {gen.result_url ?
            <div className="aspect-video bg-secondary">
                    <Image src={gen.result_url} fittingType="fill" className="w-full h-full" />
                  </div> :

            <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                  </div>
            }
                <div className="p-2">
                  <p className="text-xs font-medium text-white truncate">{gen.title || gen.prompt?.substring(0, 30)}</p>
                  <p className="text-[10px] text-muted-foreground">{gen.type}</p>
                </div>
              </Link>
          )}
          </div>
        </div>
      }
    </div>);

}