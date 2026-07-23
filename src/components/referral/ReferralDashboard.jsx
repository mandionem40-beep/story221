import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, MousePointerClick, UserPlus, Clapperboard, Diamond, Share2, Loader2, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generateReferralCode } from "@/lib/generation-utils";
import ReferralShareModal from "@/components/referral/ReferralShareModal";

export default function ReferralDashboard({ currentUser }) {
  const [stats, setStats] = useState({ clicks: 0, signups: 0, published: 0, rewards: 0, pendingRewards: 0 });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [referralCode, setReferralCode] = useState(currentUser?.referral_code || "");

  const referralLink = `${window.location.origin}/register?ref=${referralCode || "—"}`;

  useEffect(() => {
    ensureReferralCode();
  }, [currentUser?.id]);

  const ensureReferralCode = async () => {
    if (currentUser?.referral_code) {
      setReferralCode(currentUser.referral_code);
      loadReferralData(currentUser.referral_code);
      return;
    }
    try {
      const code = generateReferralCode(currentUser?.username || currentUser?.email || "USER");
      await base44.auth.updateMe({ referral_code: code });
      setReferralCode(code);
      loadReferralData(code);
    } catch {
      setLoading(false);
    }
  };

  const loadReferralData = async (code) => {
    if (!code || !currentUser?.id) { setLoading(false); return; }
    try {
      const [clicks, allUsers, allGens, allReels] = await Promise.all([
        base44.entities.ReferralClick.filter({ referrer_id: currentUser.id }),
        base44.entities.User.list("-created_date", 500),
        base44.entities.Generation.filter({ is_published: true }),
        base44.entities.Reel.list("-created_date", 500),
      ]);

      // Filleuls = users referred by me
      const myReferrals = (allUsers || []).filter(u => u.referred_by === code);
      const referralUserIds = new Set(myReferrals.map(u => u.id));

      // Published = referred users who have a published reel
      const publishedReels = (allReels || []).filter(r => referralUserIds.has(r.created_by_id));
      const publishedUserIds = new Set(publishedReels.map(r => r.created_by_id));
      const publishedCount = publishedUserIds.size;

      // Rewards = published referrals (each gives 5 diamonds)
      const rewardsEarned = publishedCount * 5;
      const pendingRewards = (myReferrals.length - publishedCount) * 5;

      setStats({
        clicks: clicks?.length || 0,
        signups: myReferrals.length,
        published: publishedCount,
        rewards: rewardsEarned,
        pendingRewards: pendingRewards > 0 ? pendingRewards : 0,
      });

      // Build referral history with status
      const reelsByCreator = {};
      (allReels || []).forEach(r => {
        if (!reelsByCreator[r.created_by_id]) reelsByCreator[r.created_by_id] = [];
        reelsByCreator[r.created_by_id].push(r);
      });

      const history = myReferrals.map(u => {
        const userReels = reelsByCreator[u.id] || [];
        const hasPublished = userReels.length > 0;
        return {
          id: u.id,
          username: u.username || u.email?.split("@")[0] || "utilisateur",
          avatar: u.avatar_url,
          joinedDate: u.created_date,
          status: hasPublished ? "published" : "signup",
          publishedCount: userReels.length,
        };
      }).sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));

      setReferrals(history);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    toast({ title: "Lien copié !", description: "Partagez-le avec vos amis." });
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: MousePointerClick, label: "Clics", value: stats.clicks, color: "text-blue-400" },
    { icon: UserPlus, label: "Inscriptions", value: stats.signups, color: "text-green-400" },
    { icon: Clapperboard, label: "Projets publiés", value: stats.published, color: "text-purple-400" },
    { icon: Diamond, label: "Diamants gagnés", value: stats.rewards, color: "text-primary" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-white">Parrainage</h2>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Partager
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Invitez vos amis et gagnez 5 💎 pour chaque filleul qui publie son premier projet.</p>

      {/* Referral link */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border mb-4">
        <input
          value={referralLink}
          readOnly
          className="flex-1 bg-transparent text-sm text-white truncate outline-none"
        />
        <button onClick={copyLink} className="px-3 py-1.5 rounded-lg bg-secondary text-white text-sm font-medium flex items-center gap-1.5 hover:bg-secondary/70 transition-colors">
          Copier
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {statCards.map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-background border border-border text-center">
            <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1.5`} />
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending rewards banner */}
      {stats.pendingRewards > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
          <Gift className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-white">
            <span className="font-bold text-primary">{stats.pendingRewards} 💎</span> en attente — vos filleuls n'ont pas encore publié leur premier projet.
          </p>
        </div>
      )}

      {/* Referral history */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historique des filleuls</h3>
        {referrals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun filleul pour le moment. Partagez votre lien !</p>
        ) : (
          <div className="space-y-2">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                  {r.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">@{r.username}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.joinedDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  r.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                }`}>
                  {r.status === "published" ? `Publié (${r.publishedCount})` : "En attente"}
                </span>
                {r.status === "published" && (
                  <ChevronRight className="w-4 h-4 text-green-400" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showShare && (
        <ReferralShareModal referralLink={referralLink} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}