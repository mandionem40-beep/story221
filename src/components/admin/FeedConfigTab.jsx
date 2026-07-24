import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Film } from "lucide-react";

const DEFAULT_RATIOS = { trending: 30, fresh: 25, personalized: 25, followed: 20 };
const RATIO_KEYS = [
  { key: "feed_ratio_trending", label: "Contenu tendance", desc: "Vidéos à fort engagement récent", field: "trending" },
  { key: "feed_ratio_fresh", label: "Contenu frais", desc: "Publications récentes pour la découverte", field: "fresh" },
  { key: "feed_ratio_personalized", label: "Contenu personnalisé", desc: "Basé sur l'historique d'interactions", field: "personalized" },
  { key: "feed_ratio_followed", label: "Comptes suivis", desc: "Part garantie pour les créateurs suivis", field: "followed" },
];

export default function FeedConfigTab() {
  const [ratios, setRatios] = useState(DEFAULT_RATIOS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRatios(); }, []);

  const loadRatios = async () => {
    try {
      const settings = await base44.entities.SiteContent.filter({ category: "general" });
      const get = (key, def) => {
        const s = settings?.find(s => s.key === key);
        const v = s ? parseInt(s.value) : def;
        return isNaN(v) ? def : v;
      };
      setRatios({
        trending: get("feed_ratio_trending", 30),
        fresh: get("feed_ratio_fresh", 25),
        personalized: get("feed_ratio_personalized", 25),
        followed: get("feed_ratio_followed", 20),
      });
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const r of RATIO_KEYS) {
        const value = ratios[r.field].toString();
        const existing = (await base44.entities.SiteContent.filter({ key: r.key }))[0];
        if (existing) {
          await base44.entities.SiteContent.update(existing.id, { value });
        } else {
          await base44.entities.SiteContent.create({ key: r.key, value, category: "general" });
        }
      }
      toast({ title: "Ratios enregistrés", description: "Le fil sera mis à jour pour tous les utilisateurs." });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
    setSaving(false);
  };

  const updateRatio = (field, value) => {
    setRatios(prev => ({ ...prev, [field]: Math.max(0, Math.min(100, value)) }));
  };

  const total = ratios.trending + ratios.fresh + ratios.personalized + ratios.followed;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Film className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-white">Fil Reels — Configuration</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Ajustez la composition du fil "Pour toi". Les valeurs doivent idéalement totaliser 100%.</p>

      {/* Total indicator */}
      <div className={`rounded-xl p-4 mb-6 border ${total === 100 ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
        <p className={`text-sm font-medium ${total === 100 ? "text-green-400" : "text-yellow-400"}`}>Total: {total}%</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total === 100 ? "✓ Les ratios sont équilibrés." : "Les valeurs seront normalisées automatiquement si le total n'est pas 100%."}
        </p>
      </div>

      {/* Ratio sliders */}
      <div className="space-y-5">
        {RATIO_KEYS.map(r => (
          <div key={r.key} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-white">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={ratios[r.field]} onChange={e => updateRatio(r.field, parseInt(e.target.value) || 0)}
                  className="w-16 h-9 rounded-lg bg-background border border-border px-2 text-sm text-white text-center" min="0" max="100" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <input type="range" value={ratios[r.field]} onChange={e => updateRatio(r.field, parseInt(e.target.value))}
              className="w-full mt-2 accent-primary" min="0" max="100" />
          </div>
        ))}
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving}
        className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer les ratios
      </button>
    </div>
  );
}