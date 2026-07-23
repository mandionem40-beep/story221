import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { loadSettings, saveSetting } from "@/lib/admin-settings";
import { Gift, Users, CheckCircle, Clock, Loader2, Save, TrendingUp, UserCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ReferralTab() {
  const [stats, setStats] = useState({ referrers: 0, referrals: 0, rewards: 0, pending: 0 });
  const [topReferrers, setTopReferrers] = useState([]);
  const [rewardAmount, setRewardAmount] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [users, reels, clicks, settings] = await Promise.all([
        base44.entities.User.list("-created_date", 500),
        base44.entities.Reel.list("-created_date", 500),
        base44.entities.ReferralClick.list("-created_date", 500),
        loadSettings("ai_config"),
      ]);

      const referredByMap = {};
      (users || []).forEach((u) => {
        if (u.referred_by) {
          referredByMap[u.referred_by] = (referredByMap[u.referred_by] || 0) + 1;
        }
      });

      const referrers = Object.entries(referredByMap).map(([code, count]) => {
        const referrerUser = (users || []).find((u) => u.referral_code === code);
        return { code, count, username: referrerUser?.username || referrerUser?.email?.split("@")[0] || "Inconnu", id: referrerUser?.id };
      }).sort((a, b) => b.count - a.count);

      const totalReferrals = (users || []).filter((u) => u.referred_by).length;
      const referralUserIds = new Set((users || []).filter((u) => u.referred_by).map((u) => u.id));
      const publishedReferrals = (reels || []).filter((r) => referralUserIds.has(r.created_by_id));
      const publishedUserIds = new Set(publishedReferrals.map((r) => r.created_by_id));
      const publishedCount = publishedUserIds.size;

      const currentReward = settings.ai_referral_reward?.value || "5";
      const rewardNum = parseInt(currentReward) || 5;
      const rewardsDistributed = publishedCount * rewardNum;
      const pendingRewards = (totalReferrals - publishedCount) * rewardNum;

      setRewardAmount(currentReward);
      setStats({
        referrers: referrers.length,
        referrals: totalReferrals,
        rewards: rewardsDistributed,
        pending: pendingRewards > 0 ? pendingRewards : 0,
      });
      setTopReferrers(referrers.slice(0, 10));
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSaveReward = async () => {
    setSaving(true);
    try {
      await saveSetting("ai_referral_reward", rewardAmount, "ai_config");
      toast({ title: "Récompense mise à jour", description: `${rewardAmount} diamants par filleul publié.` });
      loadAll();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  const statCards = [
    { icon: Users, label: "Parrains", value: stats.referrers, color: "bg-blue-500/10" },
    { icon: UserCheck, label: "Filleuls", value: stats.referrals, color: "bg-green-500/10" },
    { icon: CheckCircle, label: "Récompenses distribuées", value: stats.rewards, color: "bg-primary/10" },
    { icon: Clock, label: "Récompenses en attente", value: stats.pending, color: "bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Gestion du parrainage</h2>
        <p className="text-sm text-muted-foreground mt-1">Suivez les performances du programme de parrainage et ajustez les récompenses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reward config */}
      <div className="rounded-2xl bg-card border border-border p-5 max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Configuration de la récompense</h3>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1.5 block">Récompense par filleul publié (diamants)</label>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white"
            />
          </div>
          <button
            onClick={handleSaveReward}
            disabled={saving}
            className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Top referrers */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Top parrains</h3>
        </div>
        {topReferrers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun parrainage pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {topReferrers.map((r, i) => (
              <div key={r.code} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-700/20 text-orange-600" : "bg-secondary text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">@{r.username}</p>
                  <p className="text-xs text-muted-foreground">Code: {r.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{r.count}</p>
                  <p className="text-xs text-muted-foreground">filleuls</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}