import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Users, Package, CreditCard, Clapperboard, BarChart3, ScrollText, Flag, Settings, ShieldAlert, Loader2, Trash2, CheckCircle, Plus, Save, Sparkles, TrendingUp, Video, Share2, Mail, Cpu, Gift, Building2, MessageCircle, MousePointerClick, Zap, Wallet, Film, MapPin, Library } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import AdjustCreditsDialog from "@/components/admin/AdjustCreditsDialog";
import MessagesAdmin from "@/components/admin/MessagesAdmin";
import DashboardTab from "@/components/admin/DashboardTab";
import AIManagementTab from "@/components/admin/AIManagementTab";
import GeneralSettingsTab from "@/components/admin/GeneralSettingsTab";
import ReferralTab from "@/components/admin/ReferralTab";
import UsersTab from "@/components/admin/UsersTab";
import TransactionsTab from "@/components/admin/TransactionsTab";
import PixelsTab from "@/components/admin/PixelsTab";
import SocialPublishingTab from "@/components/admin/SocialPublishingTab";
import FinanceTab from "@/components/admin/FinanceTab";
import FeedConfigTab from "@/components/admin/FeedConfigTab";
import PlacesTab from "@/components/admin/PlacesTab";
import AiReferencesTab from "@/components/admin/AiReferencesTab";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "packs", label: "Packs", icon: Package },
  { id: "transactions", label: "Paiements", icon: CreditCard },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "reels", label: "Reels", icon: Clapperboard },
  { id: "showcase", label: "Vitrine", icon: Video },
  { id: "reports", label: "Modération", icon: Flag },
  { id: "ai", label: "IA", icon: Cpu },
  { id: "referral", label: "Parrainage", icon: Gift },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Réseaux", icon: Share2 },
  { id: "params", label: "Paramètres", icon: Building2 },
  { id: "pixels", label: "Pixels", icon: MousePointerClick },
  { id: "social_pub", label: "Publication Auto", icon: Zap },
  { id: "feed", label: "Fil Reels", icon: Film },
  { id: "places", label: "Lieux Réels", icon: MapPin },
  { id: "ai_refs", label: "Biblio. Réf. IA", icon: Library },
  { id: "messages", label: "Messagerie", icon: Mail },
];

export default function SuperAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [newPack, setNewPack] = useState({ name: "", diamonds: 0, price_fcfa: 0, popular: false });
  const [newShowcase, setNewShowcase] = useState({ title: "", subtitle: "", tags: "", video_url: "", thumbnail_url: "" });
  const [adjustUser, setAdjustUser] = useState(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: "tiktok", label: "", url: "" });

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      return;
    }
    loadTabData(activeTab);
  }, [user, activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      let result = {};
      if (tab === "dashboard") {
        const [users, gens, txs, reels, packs, reports, feedbacks, polls, conversations, referralClicks] = await Promise.all([
          base44.entities.User.list("-created_date", 500),
          base44.entities.Generation.list("-created_date", 500),
          base44.entities.Transaction.list("-created_date", 500),
          base44.entities.Reel.list("-created_date", 500),
          base44.entities.DiamondPack.list(),
          base44.entities.Report.list("-created_date", 200),
          base44.entities.Feedback.list("-created_date", 200),
          base44.entities.Poll.list("-created_date", 200),
          base44.entities.Conversation.list("-created_date", 200),
          base44.entities.ReferralClick.list("-created_date", 200),
        ]);
        // Build referral data from user.referred_by
        const referredUsers = (users || []).filter(u => u.referred_by);
        result = {
          users: users || [], generations: gens || [], transactions: txs || [],
          reels: reels || [], packs: packs || [], reports: reports || [],
          feedbacks: feedbacks || [], polls: polls || [], conversations: conversations || [],
          referrals: referredUsers, referralClicks: referralClicks || [],
          messages: [],
        };
      } else if (tab === "users") {
        result = { users: await base44.entities.User.list("-created_date", 200) };
      } else if (tab === "packs") {
        result = { packs: await base44.entities.DiamondPack.list() };
      } else if (tab === "transactions") {
        result = { transactions: await base44.entities.Transaction.list("-created_date", 200) };
      } else if (tab === "finance") {
        const [txs, packs, expenses] = await Promise.all([
          base44.entities.Transaction.list("-created_date", 500),
          base44.entities.DiamondPack.list(),
          base44.entities.Expense.list("-date", 200),
        ]);
        result = { transactions: txs || [], packs: packs || [], expenses: expenses || [] };
      } else if (tab === "reels") {
        result = { reels: await base44.entities.Reel.list("-created_date", 200) };
      } else if (tab === "showcase") {
        result = { showcases: await base44.entities.ShowcaseVideo.list("display_order", 200) };
      } else if (tab === "reports") {
        const [reports, comments] = await Promise.all([
          base44.entities.Report.list("-created_date", 200),
          base44.entities.Comment.list("-created_date", 200),
        ]);
        result = { reports: reports || [], comments: comments || [] };
      } else if (tab === "logs") {
        result = { logs: await base44.entities.AdminLog.list("-created_date", 200) };
      } else if (tab === "analytics") {
        const [users, gens, txs, reels, likes, comments, follows] = await Promise.all([
          base44.entities.User.list("-created_date", 200),
          base44.entities.Generation.list("-created_date", 200),
          base44.entities.Transaction.list("-created_date", 200),
          base44.entities.Reel.list("-created_date", 200),
          base44.entities.Like.list("-created_date", 200),
          base44.entities.Comment.list("-created_date", 200),
          base44.entities.Follow.list("-created_date", 200),
        ]);
        result = { users: users || [], generations: gens || [], transactions: txs || [], reels: reels || [], likes: likes || [], comments: comments || [], follows: follows || [] };
      } else if (tab === "settings") {
        result = { socialLinks: await base44.entities.SocialLink.list("display_order", 50) };
      } else if (tab === "params" || tab === "ai" || tab === "referral" || tab === "pixels" || tab === "social_pub") {
        result = {};  // these tabs load their own data
      } else if (tab === "messages") {
        result = {};  // MessagesAdmin loads its own data
      } else if (tab === "ai_refs") {
        result = {};  // AiReferencesTab loads its own data
      }
      setData(result);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const logAction = async (action, details, targetUserId) => {
    try {
      await base44.entities.AdminLog.create({ action, details, target_user_id: targetUserId });
    } catch { /* ignore */ }
  };

  const handleDeleteReel = async (reelId) => {
    if (!confirm("Supprimer ce Reel ?")) return;
    await base44.entities.Reel.delete(reelId);
    logAction("delete_reel", `Reel ${reelId} supprimé`);
    loadTabData("reels");
    toast({ title: "Reel supprimé" });
  };

  const handleToggleReelVisibility = async (reel) => {
    await base44.entities.Reel.update(reel.id, { hidden: !reel.hidden });
    logAction("toggle_reel_visibility", `Reel ${reel.id} ${reel.hidden ? "affiché" : "masqué"}`);
    loadTabData("reels");
    toast({ title: reel.hidden ? "Reel affiché" : "Reel masqué" });
  };

  const handleToggleReelFeatured = async (reel) => {
    await base44.entities.Reel.update(reel.id, { featured: !reel.featured });
    logAction("toggle_reel_featured", `Reel ${reel.id} ${reel.featured ? "retiré des vedettes" : "mis en vedette"}`);
    loadTabData("reels");
    toast({ title: reel.featured ? "Retiré des vedettes" : "Mis en vedette" });
  };

  const handleAddShowcase = async () => {
    if (!newShowcase.title) return;
    const tags = newShowcase.tags ? newShowcase.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    await base44.entities.ShowcaseVideo.create({
      title: newShowcase.title,
      subtitle: newShowcase.subtitle,
      tags,
      video_url: newShowcase.video_url,
      thumbnail_url: newShowcase.thumbnail_url,
      active: true,
      display_order: (data.showcases?.length || 0) + 1,
    });
    logAction("add_showcase", `Vidéo vitrine "${newShowcase.title}" ajoutée`);
    setNewShowcase({ title: "", subtitle: "", tags: "", video_url: "", thumbnail_url: "" });
    loadTabData("showcase");
    toast({ title: "Vidéo ajoutée à la vitrine" });
  };

  const handleToggleShowcase = async (item) => {
    await base44.entities.ShowcaseVideo.update(item.id, { active: !item.active });
    loadTabData("showcase");
  };

  const handleDeleteShowcase = async (id) => {
    if (!confirm("Supprimer cette vidéo de la vitrine ?")) return;
    await base44.entities.ShowcaseVideo.delete(id);
    logAction("delete_showcase", `Vidéo vitrine ${id} supprimée`);
    loadTabData("showcase");
    toast({ title: "Vidéo supprimée" });
  };

  const handleResolveReport = async (reportId) => {
    await base44.entities.Report.update(reportId, { status: "resolved" });
    logAction("resolve_report", `Signalement ${reportId} résolu`);
    loadTabData("reports");
    toast({ title: "Signalement résolu" });
  };

  const handleDismissReport = async (reportId) => {
    await base44.entities.Report.update(reportId, { status: "dismissed" });
    logAction("dismiss_report", `Signalement ${reportId} rejeté`);
    loadTabData("reports");
    toast({ title: "Signalement rejeté" });
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    await base44.entities.Comment.delete(commentId);
    logAction("delete_comment", `Commentaire ${commentId} supprimé`);
    loadTabData("reports");
    toast({ title: "Commentaire supprimé" });
  };

  const handleSavePack = async (pack) => {
    try {
      await base44.entities.DiamondPack.update(pack.id, {
        name: pack.name,
        diamonds: pack.diamonds,
        price_fcfa: pack.price_fcfa,
        popular: pack.popular,
        active: pack.active,
      });
      logAction("update_pack", `Pack ${pack.name} modifié`);
      loadTabData("packs");
      toast({ title: "Pack mis à jour", description: "Les changements sont immédiatement effectifs." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le pack.", variant: "destructive" });
    }
  };

  const handleDeletePack = async (pack) => {
    if (!confirm(`Supprimer le pack "${pack.name}" ?`)) return;
    try {
      await base44.entities.DiamondPack.delete(pack.id);
      logAction("delete_pack", `Pack ${pack.name} supprimé`);
      loadTabData("packs");
      toast({ title: "Pack supprimé" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleAddPack = async () => {
    if (!newPack.name || !newPack.diamonds || !newPack.price_fcfa) return;
    await base44.entities.DiamondPack.create({
      ...newPack,
      active: true,
      display_order: (data.packs?.length || 0) + 1,
    });
    logAction("add_pack", `Pack ${newPack.name} ajouté`);
    setNewPack({ name: "", diamonds: 0, price_fcfa: 0, popular: false });
    loadTabData("packs");
    toast({ title: "Pack ajouté" });
  };

  const handleAdjustCredits = async (amount, description) => {
    if (!adjustUser) return;
    const currentDiamonds = adjustUser.diamonds || 0;
    const newBalance = currentDiamonds + amount;
    try {
      await base44.entities.User.update(adjustUser.id, { diamonds: newBalance });
      await base44.entities.Transaction.create({
        type: "admin_adjustment",
        amount,
        description: description || `Ajustement manuel par l'admin`,
        reference: `admin_${Date.now()}`,
        balance_after: newBalance,
      });
      logAction("adjust_credits", `${amount > 0 ? "+" : ""}${amount} diamants pour ${adjustUser.id}`, adjustUser.id);
      setShowAdjust(false);
      setAdjustUser(null);
      loadTabData("users");
      toast({ title: "Solde ajusté", description: `Nouveau solde: ${newBalance} 💎` });
    } catch {
      toast({ title: "Erreur", description: "Action non autorisée.", variant: "destructive" });
    }
  };

  const handleUserStatus = async (userObj, status) => {
    const labels = { active: "activé", suspended: "suspendu", banned: "banni" };
    try {
      await base44.entities.User.update(userObj.id, { account_status: status });
      logAction("user_status", `Utilisateur ${userObj.id} ${labels[status]}`, userObj.id);
      loadTabData("users");
      toast({ title: `Utilisateur ${labels[status]}` });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userObj) => {
    if (!confirm(`Supprimer définitivement ${userObj.email} ? Cette action est irréversible.`)) return;
    try {
      await base44.entities.User.delete(userObj.id);
      logAction("delete_user", `Utilisateur ${userObj.id} supprimé`, userObj.id);
      loadTabData("users");
      toast({ title: "Utilisateur supprimé" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleUpdateUserRole = async (userObj, role) => {
    try {
      await base44.entities.User.update(userObj.id, { role });
      logAction("update_role", `Rôle de ${userObj.id} → ${role}`, userObj.id);
      loadTabData("users");
      toast({ title: "Rôle mis à jour" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleAddSocial = async () => {
    if (!newSocial.url) return;
    const labels = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook", x: "X (Twitter)", linkedin: "LinkedIn" };
    await base44.entities.SocialLink.create({
      platform: newSocial.platform,
      label: newSocial.label || labels[newSocial.platform],
      url: newSocial.url,
      active: true,
      display_order: (data.socialLinks?.length || 0) + 1,
    });
    logAction("add_social", `Réseau ${newSocial.platform} ajouté`);
    setNewSocial({ platform: "tiktok", label: "", url: "" });
    loadTabData("settings");
    toast({ title: "Réseau ajouté", description: "Visible immédiatement sur la plateforme." });
  };

  const handleToggleSocial = async (item) => {
    await base44.entities.SocialLink.update(item.id, { active: !item.active });
    loadTabData("settings");
  };

  const handleSaveSocial = async (id, edited) => {
    await base44.entities.SocialLink.update(id, { label: edited.label, url: edited.url });
    logAction("update_social", `Réseau social ${id} modifié`);
    loadTabData("settings");
    toast({ title: "Réseau mis à jour" });
  };

  const handleDeleteSocial = async (id) => {
    if (!confirm("Supprimer ce réseau social ?")) return;
    await base44.entities.SocialLink.delete(id);
    logAction("delete_social", `Réseau social ${id} supprimé`);
    loadTabData("settings");
    toast({ title: "Réseau supprimé" });
  };

  if (user && user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Accès refusé</h1>
        <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/app" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-card border-r border-border lg:min-h-screen p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-white">Super Admin</h1>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:text-white hover:bg-secondary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <Link to="/app" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-secondary whitespace-nowrap mt-2">
            ← Retour à l'app
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : (
          <>
            {/* Dashboard tab */}
            {activeTab === "dashboard" && (
              <DashboardTab data={data} />
            )}

            {/* Users tab */}
            {activeTab === "users" && (
              <UsersTab
                users={data.users || []}
                onAdjust={(u) => { setAdjustUser(u); setShowAdjust(true); }}
                onStatus={handleUserStatus}
                onDelete={handleDeleteUser}
                onRoleChange={handleUpdateUserRole}
              />
            )}

            {/* Packs tab */}
            {activeTab === "packs" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Gestion des packs</h2>
                <div className="space-y-3 mb-6">
                  {(data.packs || []).map(pack => (
                    <PackEditor key={pack.id} pack={pack} onSave={handleSavePack} onDelete={handleDeletePack} />
                  ))}
                </div>
                {/* Add new pack */}
                <div className="rounded-2xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Ajouter un pack</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input value={newPack.name} onChange={e => setNewPack({...newPack, name: e.target.value})} placeholder="Nom" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input type="number" value={newPack.diamonds || ""} onChange={e => setNewPack({...newPack, diamonds: parseInt(e.target.value) || 0})} placeholder="Diamants" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input type="number" value={newPack.price_fcfa || ""} onChange={e => setNewPack({...newPack, price_fcfa: parseInt(e.target.value) || 0})} placeholder="Prix FCFA" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <button onClick={handleAddPack} className="h-10 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" />Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions tab */}
            {activeTab === "transactions" && (
              <TransactionsTab transactions={data.transactions || []} />
            )}

            {/* Finance tab */}
            {activeTab === "finance" && (
              <FinanceTab
                transactions={data.transactions || []}
                packs={data.packs || []}
                expenses={data.expenses || []}
                onAddExpense={() => loadTabData("finance")}
                onDeleteExpense={async (id) => {
                  try {
                    await base44.entities.Expense.delete(id);
                    loadTabData("finance");
                    toast({ title: "Dépense supprimée" });
                  } catch {
                    toast({ title: "Erreur", variant: "destructive" });
                  }
                }}
              />
            )}

            {/* Reels tab */}
            {activeTab === "reels" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Gestion des Reels</h2>
                <div className="space-y-2">
                  {(data.reels || []).map(reel => (
                    <div key={reel.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{reel.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{reel.views || 0} vues</span>
                          <span>@{reel.author_name || "createur"}</span>
                          {reel.trending_score > 0 && <span className="text-primary font-medium">🔥 Tendance</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleReelVisibility(reel)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${reel.hidden ? "bg-yellow-500/20 text-yellow-400" : "bg-secondary text-muted-foreground"}`}
                        >
                          {reel.hidden ? "Masqué" : "Visible"}
                        </button>
                        <button
                          onClick={() => handleToggleReelFeatured(reel)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${reel.featured ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}
                        >
                          ⭐
                        </button>
                        <button onClick={() => handleDeleteReel(reel.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Showcase tab */}
            {activeTab === "showcase" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Vitrine — Vidéos en vedette</h2>
                <p className="text-sm text-muted-foreground mb-4">Ces vidéos apparaissent sur la page d'accueil dans la section "Ils ont créé ça avec Story221".</p>

                <div className="rounded-2xl bg-card border border-border p-4 mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Ajouter une vidéo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input value={newShowcase.title} onChange={e => setNewShowcase({...newShowcase, title: e.target.value})} placeholder="Titre *" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input value={newShowcase.subtitle} onChange={e => setNewShowcase({...newShowcase, subtitle: e.target.value})} placeholder="Sous-titre (ex: Style Afrobeat)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input value={newShowcase.tags} onChange={e => setNewShowcase({...newShowcase, tags: e.target.value})} placeholder="Tags séparés par virgules (ex: ANNIVERSAIRE, FÊTE)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input value={newShowcase.thumbnail_url} onChange={e => setNewShowcase({...newShowcase, thumbnail_url: e.target.value})} placeholder="URL de la miniature (image)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input value={newShowcase.video_url} onChange={e => setNewShowcase({...newShowcase, video_url: e.target.value})} placeholder="URL de la vidéo" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white sm:col-span-2" />
                  </div>
                  <button onClick={handleAddShowcase} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />Ajouter à la vitrine
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(data.showcases || []).map(item => (
                    <div key={item.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                      <div className="relative aspect-video bg-secondary">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        {!item.active && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-xs text-white font-semibold">Masqué</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle || "—"}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((t, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleToggleShowcase(item)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${item.active ? "bg-green-500/20 text-green-500" : "bg-secondary text-muted-foreground"}`}>
                            {item.active ? "Visible" : "Masqué"}
                          </button>
                          <button onClick={() => handleDeleteShowcase(item.id)} className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports / Moderation tab */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Modération</h2>

                {/* Reports */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flag className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-white">Signalements ({(data.reports || []).length})</h3>
                  </div>
                  {(data.reports || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucun signalement.</p>
                  ) : (
                    <div className="space-y-2">
                      {(data.reports || []).map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                          <Flag className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{r.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              <span className={`font-medium ${r.status === "pending" ? "text-yellow-400" : r.status === "resolved" ? "text-green-400" : "text-muted-foreground"}`}>{r.status}</span>
                              {" · "}
                              {new Date(r.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              {r.reel_id && ` · Reel: ${r.reel_id.substring(0, 8)}...`}
                              {r.comment_id && ` · Commentaire: ${r.comment_id.substring(0, 8)}...`}
                            </p>
                          </div>
                          {r.status === "pending" && (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleResolveReport(r.id)} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />Résoudre
                              </button>
                              <button onClick={() => handleDismissReport(r.id)} className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-medium">
                                Rejeter
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments moderation */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-white">Commentaires récents ({(data.comments || []).length})</h3>
                  </div>
                  {(data.comments || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucun commentaire.</p>
                  ) : (
                    <div className="space-y-2">
                      {(data.comments || []).slice(0, 30).map(c => (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                          <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{c.content}</p>
                            <p className="text-xs text-muted-foreground">Reel: {c.reel_id?.substring(0, 8)}... · {new Date(c.created_date).toLocaleDateString("fr-FR")}</p>
                          </div>
                          <button onClick={() => handleDeleteComment(c.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Management tab */}
            {activeTab === "ai" && (
              <AIManagementTab />
            )}

            {/* Referral tab */}
            {activeTab === "referral" && (
              <ReferralTab />
            )}

            {/* General Settings tab */}
            {activeTab === "params" && (
              <GeneralSettingsTab />
            )}

            {/* Pixels tab */}
            {activeTab === "pixels" && (
              <PixelsTab />
            )}

            {/* Social Auto-Publish tab */}
            {activeTab === "social_pub" && (
              <SocialPublishingTab />
            )}

            {activeTab === "feed" && (
              <FeedConfigTab />
            )}

            {activeTab === "places" && (
              <PlacesTab />
            )}

            {activeTab === "ai_refs" && (
              <AiReferencesTab />
            )}

            {/* Analytics tab */}
            {activeTab === "analytics" && (
              <AnalyticsTab data={data} />
            )}

            {/* Logs tab */}
            {activeTab === "logs" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Logs d'administration</h2>
                {(data.logs || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Aucun log.</p>
                ) : (
                  <div className="space-y-2">
                    {(data.logs || []).map(log => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                        <ScrollText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-white">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.details} · {new Date(log.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages tab */}
            {activeTab === "messages" && (
              <MessagesAdmin />
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Réseaux sociaux</h2>
                <p className="text-sm text-muted-foreground mb-6">Gérez les réseaux sociaux affichés sur la landing page et le footer. Les modifications sont appliquées immédiatement sur toute la plateforme.</p>

                <div className="rounded-2xl bg-card border border-border p-4 mb-6 max-w-2xl">
                  <h3 className="text-sm font-semibold text-white mb-3">Ajouter un réseau</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <select value={newSocial.platform} onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })} className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="x">X (Twitter)</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <input value={newSocial.label} onChange={e => setNewSocial({ ...newSocial, label: e.target.value })} placeholder="Libellé (optionnel)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                    <input value={newSocial.url} onChange={e => setNewSocial({ ...newSocial, url: e.target.value })} placeholder="https://..." className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                  </div>
                  <button onClick={handleAddSocial} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />Ajouter
                  </button>
                </div>

                <div className="space-y-2 max-w-2xl">
                  {(data.socialLinks || []).map(item => (
                    <SocialLinkEditor key={item.id} item={item} onSave={handleSaveSocial} onToggle={handleToggleSocial} onDelete={handleDeleteSocial} />
                  ))}
                  {(data.socialLinks || []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucun réseau social configuré. Ajoutez-en un ci-dessus.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <AdjustCreditsDialog
        user={adjustUser}
        open={showAdjust}
        onClose={() => setShowAdjust(false)}
        onConfirm={handleAdjustCredits}
      />
    </div>
  );
}

function PackEditor({ pack, onSave, onDelete }) {
  const [edited, setEdited] = useState(pack);
  const [changed, setChanged] = useState(false);

  const update = (field, value) => {
    setEdited({ ...edited, [field]: value });
    setChanged(true);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex flex-wrap items-center gap-3">
      <input value={edited.name} onChange={e => update("name", e.target.value)} className="flex-1 min-w-[100px] h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
      <input type="number" value={edited.diamonds} onChange={e => update("diamonds", parseInt(e.target.value) || 0)} className="w-24 h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
      <span className="text-xs text-muted-foreground">💎</span>
      <input type="number" value={edited.price_fcfa} onChange={e => update("price_fcfa", parseInt(e.target.value) || 0)} className="w-28 h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
      <span className="text-xs text-muted-foreground">FCFA</span>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input type="checkbox" checked={edited.popular} onChange={e => update("popular", e.target.checked)} className="accent-primary" />
        Populaire
      </label>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input type="checkbox" checked={edited.active !== false} onChange={e => update("active", e.target.checked)} className="accent-primary" />
        Actif
      </label>
      <button
        onClick={() => { onSave(edited); setChanged(false); }}
        disabled={!changed}
        className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-30"
      >
        <Save className="w-3.5 h-3.5" />Enregistrer
      </button>
      <button
        onClick={() => onDelete(pack)}
        className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function SocialLinkEditor({ item, onSave, onToggle, onDelete }) {
  const [edited, setEdited] = useState({ label: item.label || "", url: item.url || "" });
  const [changed, setChanged] = useState(false);

  const update = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
    setChanged(true);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-white capitalize min-w-[70px]">{item.platform}</span>
      <input value={edited.label} onChange={e => update("label", e.target.value)} placeholder="Libellé" className="flex-1 min-w-[80px] h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
      <input value={edited.url} onChange={e => update("url", e.target.value)} placeholder="https://..." className="flex-[2] min-w-[120px] h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
      <button onClick={() => onToggle(item)} className={`px-3 py-2 rounded-lg text-xs font-medium ${item.active ? "bg-green-500/20 text-green-500" : "bg-secondary text-muted-foreground"}`}>
        {item.active ? "Actif" : "Inactif"}
      </button>
      <button onClick={() => { onSave(item.id, edited); setChanged(false); }} disabled={!changed} className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-30">
        <Save className="w-3.5 h-3.5" />Enregistrer
      </button>
      <button onClick={() => onDelete(item.id)} className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}