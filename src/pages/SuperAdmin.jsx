import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Users, Package, CreditCard, Clapperboard, BarChart3, ScrollText, Flag, Settings, ShieldAlert, Loader2, Trash2, CheckCircle, Plus, Save, Sparkles, TrendingUp, Video } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import AdjustCreditsDialog from "@/components/admin/AdjustCreditsDialog";

const tabs = [
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "packs", label: "Packs", icon: Package },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "reels", label: "Reels", icon: Clapperboard },
  { id: "showcase", label: "Vitrine", icon: Video },
  { id: "reports", label: "Signalements", icon: Flag },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

export default function SuperAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("stats");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [newPack, setNewPack] = useState({ name: "", diamonds: 0, price_fcfa: 0, popular: false });
  const [newShowcase, setNewShowcase] = useState({ title: "", subtitle: "", tags: "", video_url: "", thumbnail_url: "" });
  const [adjustUser, setAdjustUser] = useState(null);
  const [showAdjust, setShowAdjust] = useState(false);

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
      if (tab === "stats") {
        const [users, gens, txs, reels, packs] = await Promise.all([
          base44.entities.User.list("-created_date", 200),
          base44.entities.Generation.list("-created_date", 200),
          base44.entities.Transaction.list("-created_date", 200),
          base44.entities.Reel.list("-created_date", 200),
          base44.entities.DiamondPack.list(),
        ]);
        const revenue = (txs || []).filter(t => t.type === "purchase").reduce((s, t) => s + (t.amount || 0), 0);
        result = { users: users || [], generations: gens || [], transactions: txs || [], reels: reels || [], packs: packs || [], revenue };
      } else if (tab === "users") {
        result = { users: await base44.entities.User.list("-created_date", 200) };
      } else if (tab === "packs") {
        result = { packs: await base44.entities.DiamondPack.list() };
      } else if (tab === "transactions") {
        result = { transactions: await base44.entities.Transaction.list("-created_date", 200) };
      } else if (tab === "reels") {
        result = { reels: await base44.entities.Reel.list("-created_date", 200) };
      } else if (tab === "showcase") {
        result = { showcases: await base44.entities.ShowcaseVideo.list("display_order", 200) };
      } else if (tab === "reports") {
        result = { reports: await base44.entities.Report.list("-created_date", 200) };
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

  const handleSavePack = async (pack) => {
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
            {/* Stats tab */}
            {activeTab === "stats" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Vue d'ensemble</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Utilisateurs", value: data.users?.length || 0, icon: Users },
                    { label: "Générations", value: data.generations?.length || 0, icon: Sparkles },
                    { label: "Reels", value: data.reels?.length || 0, icon: Clapperboard },
                    { label: "Revenus (💎)", value: data.revenue || 0, icon: CreditCard },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl bg-card border border-border p-5">
                      <s.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Utilisateurs récents</h3>
                <div className="space-y-2">
                  {(data.users || []).slice(0, 10).map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                        {(u.username || u.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">@{u.username || u.email?.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{u.diamonds || 0} 💎</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Gestion des utilisateurs</h2>
                <div className="space-y-2">
                  {(data.users || []).map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                        {(u.username || u.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">@{u.username || u.email?.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">{u.diamonds || 0} 💎</p>
                        <p className="text-xs text-muted-foreground">{u.role || "user"}</p>
                      </div>
                      <button onClick={() => { setAdjustUser(u); setShowAdjust(true); }} className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-medium">
                        Ajuster
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packs tab */}
            {activeTab === "packs" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Gestion des packs</h2>
                <div className="space-y-3 mb-6">
                  {(data.packs || []).map(pack => (
                    <PackEditor key={pack.id} pack={pack} onSave={handleSavePack} />
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
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Transactions</h2>
                <div className="space-y-2">
                  {(data.transactions || []).map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_date).toLocaleDateString("fr-FR")} · {tx.type}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-500" : "text-destructive"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount} 💎
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reels tab */}
            {activeTab === "reels" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Modération des Reels</h2>
                <div className="space-y-2">
                  {(data.reels || []).map(reel => (
                    <div key={reel.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{reel.title}</p>
                        <p className="text-xs text-muted-foreground">{reel.views || 0} vues · @{reel.author_name || "createur"}</p>
                      </div>
                      <button onClick={() => handleDeleteReel(reel.id)} className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

            {/* Reports tab */}
            {activeTab === "reports" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Signalements</h2>
                {(data.reports || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Aucun signalement.</p>
                ) : (
                  <div className="space-y-2">
                    {(data.reports || []).map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                        <Flag className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{r.reason}</p>
                          <p className="text-xs text-muted-foreground">{r.status} · {new Date(r.created_date).toLocaleDateString("fr-FR")}</p>
                        </div>
                        {r.status === "pending" && (
                          <button onClick={() => handleResolveReport(r.id)} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />Résoudre
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

function PackEditor({ pack, onSave }) {
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
    </div>
  );
}