import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save, Trash2, Plus, BarChart, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function PixelsTab() {
  const [pixels, setPixels] = useState({ facebook_pixel_id: "", tiktok_pixel_id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPixels();
  }, []);

  const loadPixels = async () => {
    setLoading(true);
    try {
      const items = await base44.entities.SiteContent.filter({ category: "general" });
      const map = {};
      (items || []).forEach(item => { map[item.key] = item.value; });
      setPixels({
        facebook_pixel_id: map.facebook_pixel_id || "",
        tiktok_pixel_id: map.tiktok_pixel_id || "",
      });
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = await base44.entities.SiteContent.filter({ category: "general" });
      const existing = {};
      (items || []).forEach(item => { existing[item.key] = item; });

      for (const [key, value] of Object.entries(pixels)) {
        if (existing[key]) {
          await base44.entities.SiteContent.update(existing[key].id, { value });
        } else {
          await base44.entities.SiteContent.create({ key, value, category: "general" });
        }
      }
      toast({ title: "Pixels enregistrés", description: "Les pixels sont actifs immédiatement." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer.", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-2">Pixels de suivi</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Ajoutez vos identifiants de pixel Facebook et TikTok pour suivre les conversions et le trafic.
        Les pixels sont injectés automatiquement sur toutes les pages de la plateforme.
      </p>

      {/* Facebook Pixel */}
      <div className="rounded-2xl bg-card border border-border p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Facebook Pixel</h3>
            <p className="text-xs text-muted-foreground">Suivi des conversions Meta Ads</p>
          </div>
          <div className="ml-auto">
            {pixels.facebook_pixel_id ? (
              <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />Connecté</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="w-3.5 h-3.5" />Non configuré</span>
            )}
          </div>
        </div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Identifiant du pixel (ex: 123456789012345)</label>
        <input
          value={pixels.facebook_pixel_id}
          onChange={e => setPixels({ ...pixels, facebook_pixel_id: e.target.value.trim() })}
          placeholder="Collez votre Facebook Pixel ID"
          className="w-full h-11 rounded-xl bg-background border border-border px-3 text-sm text-white font-mono"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Trouvez-le dans Meta Events Manager → Sources de données → Pixel.
        </p>
      </div>

      {/* TikTok Pixel */}
      <div className="rounded-2xl bg-card border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-black border border-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">TT</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">TikTok Pixel</h3>
            <p className="text-xs text-muted-foreground">Suivi des conversions TikTok Ads</p>
          </div>
          <div className="ml-auto">
            {pixels.tiktok_pixel_id ? (
              <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />Connecté</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="w-3.5 h-3.5" />Non configuré</span>
            )}
          </div>
        </div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Identifiant du pixel (ex: C12AB3CD4E5FG6H7)</label>
        <input
          value={pixels.tiktok_pixel_id}
          onChange={e => setPixels({ ...pixels, tiktok_pixel_id: e.target.value.trim() })}
          placeholder="Collez votre TikTok Pixel ID"
          className="w-full h-11 rounded-xl bg-background border border-border px-3 text-sm text-white font-mono"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Trouvez-le dans TikTok Ads Manager → Assets → Events → Pixel.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer les pixels
      </button>
    </div>
  );
}