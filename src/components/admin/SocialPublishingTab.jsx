import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save, CheckCircle, XCircle, Share2, Zap, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    desc: "Publication automatique sur le compte Instagram Business de la plateforme",
    available: true,
    color: "bg-gradient-to-br from-purple-600 to-pink-500",
    icon: "📷",
  },
  {
    id: "facebook",
    name: "Facebook Pages",
    desc: "Publication sur la page Facebook de la plateforme",
    available: true,
    color: "bg-blue-600",
    icon: "👥",
  },
  {
    id: "tiktok",
    name: "TikTok",
    desc: "Publication via l'API TikTok Content Posting (clés API requises)",
    available: false,
    color: "bg-black border border-white/20",
    icon: "🎵",
    note: "Nécessite des clés API TikTok Content Posting. Configurez les secrets TIKTOK_CLIENT_KEY et TIKTOK_CLIENT_SECRET.",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    desc: "Publication via l'API YouTube Data v3 (clés Google requises)",
    available: false,
    color: "bg-red-600",
    icon: "▶️",
    note: "Nécessite des clés API Google OAuth2. Configurez les secrets GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.",
  },
];

export default function SocialPublishingTab() {
  const [settings, setSettings] = useState({
    autopublish_instagram: false,
    autopublish_facebook: false,
    autopublish_tiktok: false,
    autopublish_youtube: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const items = await base44.entities.AppSetting.list();
      const map = {};
      (items || []).forEach(item => { map[item.key] = item.value; });
      setSettings({
        autopublish_instagram: map.autopublish_instagram === "true",
        autopublish_facebook: map.autopublish_facebook === "true",
        autopublish_tiktok: map.autopublish_tiktok === "true",
        autopublish_youtube: map.autopublish_youtube === "true",
      });
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = await base44.entities.AppSetting.list();
      const existing = {};
      (items || []).forEach(item => { existing[item.key] = item; });

      const updates = [
        { key: "autopublish_instagram", value: String(settings.autopublish_instagram) },
        { key: "autopublish_facebook", value: String(settings.autopublish_facebook) },
        { key: "autopublish_tiktok", value: String(settings.autopublish_tiktok) },
        { key: "autopublish_youtube", value: String(settings.autopublish_youtube) },
      ];

      for (const u of updates) {
        if (existing[u.key]) {
          await base44.entities.AppSetting.update(existing[u.key].id, { value: u.value });
        } else {
          await base44.entities.AppSetting.create({ key: u.key, value: u.value, description: "Publication automatique" });
        }
      }
      toast({ title: "Paramètres enregistrés", description: "La publication automatique est configurée." });
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
      <h2 className="text-xl font-bold text-white mb-2">Publication automatique</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Quand un utilisateur publie un Reel sur Story221, la vidéo est automatiquement publiée
        sur les réseaux sociaux connectés de la plateforme.
      </p>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">Comment ça marche ?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Activez les plateformes ci-dessous. Chaque nouvelle vidéo publiée dans les Reels
            sera automatiquement partagée sur les comptes officiels de Story221.
          </p>
        </div>
      </div>

      {/* Platform list */}
      <div className="space-y-3 mb-6">
        {PLATFORMS.map(platform => {
          const enabled = settings[`autopublish_${platform.id}`];
          return (
            <div
              key={platform.id}
              className={`rounded-2xl bg-card border p-4 transition-colors ${
                enabled ? "border-primary/40" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center text-lg flex-shrink-0`}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{platform.name}</h3>
                    {platform.available ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-400"><CheckCircle className="w-3 h-3" />Connecté</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><XCircle className="w-3 h-3" />Indisponible</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{platform.desc}</p>
                  {platform.note && (
                    <p className="text-xs text-yellow-500/80 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {platform.note}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => platform.available && handleToggle(`autopublish_${platform.id}`)}
                  disabled={!platform.available}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-30 ${
                    enabled ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer la configuration
      </button>
    </div>
  );
}