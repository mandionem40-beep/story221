import { useState, useEffect } from "react";
import { getNotificationPreferences, toggleNotificationPreference } from "@/lib/notifications";
import { Bell, Loader2 } from "lucide-react";

const NOTIF_TYPES = [
  { id: "like", label: "Likes", desc: "Quand quelqu'un aime votre vidéo" },
  { id: "comment", label: "Commentaires & réponses", desc: "Nouveaux commentaires et réponses" },
  { id: "follow", label: "Nouveaux abonnés", desc: "Quand quelqu'un vous suit" },
  { id: "diamonds", label: "Diamants reçus", desc: "Parrainages et remboursements" },
  { id: "influencer_published", label: "Influenceurs IA", desc: "Publications planifiées d'influenceurs" },
  { id: "performance", label: "Paliers de performance", desc: "Vidéos qui atteignent un seuil notable" },
  { id: "moderation", label: "Modération", desc: "Contenu retiré par la modération" },
];

export default function NotificationPreferences({ currentUser }) {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPrefs(); }, [currentUser]);

  const loadPrefs = async () => {
    try {
      const data = await getNotificationPreferences(currentUser?.id);
      const map = {};
      for (const p of data) map[p.notification_type] = p.enabled;
      setPrefs(map);
    } catch {}
    setLoading(false);
  };

  const toggle = async (type) => {
    const newEnabled = prefs[type] === undefined ? false : !prefs[type];
    setPrefs(prev => ({ ...prev, [type]: newEnabled }));
    await toggleNotificationPreference(currentUser?.id, type, newEnabled);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-white">Préférences de notifications</h3>
      </div>
      <div className="space-y-1">
        {NOTIF_TYPES.map(t => (
          <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-sm text-white">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
            <button
              onClick={() => toggle(t.id)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[t.id] !== false ? "bg-primary" : "bg-secondary"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs[t.id] !== false ? "translate-x-5" : ""}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}