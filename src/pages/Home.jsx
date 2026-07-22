import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Diamond, Gift, Sparkles } from "lucide-react";
import { contentTypes } from "@/lib/generation-utils";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

export default function Home() {
  const { currentUser } = useOutletContext();
  const [recentGens, setRecentGens] = useState([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const gens = await base44.entities.Generation.list("-created_date", 4);
        setRecentGens(gens || []);
      } catch {
        // empty state is fine
      }
    };
    loadRecent();
  }, []);

  const diamonds = currentUser?.diamonds ?? 0;
  const freeTrialAvailable = !currentUser?.free_trial_used;
  const username = currentUser?.username || currentUser?.full_name || "créateur";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Bonjour, <span className="gradient-text-red">{username}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Que voulez-vous créer aujourd'hui ?</p>
      </div>

      {/* Balance + Free Trial */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Diamond className="w-5 h-5 text-primary" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Solde</p>
            <p className="text-lg font-bold text-white">{diamonds} 💎</p>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Essai gratuit</p>
            <p className="text-lg font-bold text-white">{freeTrialAvailable ? "Disponible" : "Utilisé"}</p>
          </div>
        </div>
      </div>

      {/* Big Create Button */}
      <Link
        to="/app/create"
        className="block relative rounded-2xl overflow-hidden mb-8 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/5" />
        <div className="absolute inset-0 bg-glow-red opacity-50" />
        <div className="relative p-6 sm:p-8 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center glow-red group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Créer</h2>
            <p className="text-sm text-white/70">Lancez une génération IA en quelques clics</p>
          </div>
        </div>
      </Link>

      {/* Content Types */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Types de création</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        {contentTypes.map((type, i) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to={`/app/create?type=${type.id}`}
              className="block rounded-2xl bg-card border border-border p-4 hover:border-primary/40 transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <type.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-white">{type.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {type.costType === "per_minute" ? `${type.baseCost} 💎/min` : `${type.baseCost} 💎`}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Creations */}
      {recentGens.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Créations récentes</h3>
            <Link to="/app/library" className="text-sm text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentGens.map((gen) => (
              <Link
                key={gen.id}
                to={`/app/library`}
                className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                {gen.result_url ? (
                  <div className="aspect-video bg-secondary">
                    <Image src={gen.result_url} fittingType="fill" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
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
    </div>
  );
}