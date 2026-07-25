import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, Loader2, BadgeCheck, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SOCIAL_OPTIONS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "snapchat", label: "Snapchat" },
  { id: "x", label: "X (Twitter)" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "other", label: "Autre" },
];

export default function InfluencerManager({ influencers, onRefresh, attributions, users, transactions, generations }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", photo_url: "", primary_social: "tiktok", profile_url: "",
    description: "", category: "", promo_code: "", referral_link: "", verified: false, status: "active",
  });

  const startEdit = (inf) => {
    setEditing(inf);
    setForm({
      name: inf.name || "", photo_url: inf.photo_url || "", primary_social: inf.primary_social || "tiktok",
      profile_url: inf.profile_url || "", description: inf.description || "", category: inf.category || "",
      promo_code: inf.promo_code || "", referral_link: inf.referral_link || "",
      verified: inf.verified || false, status: inf.status || "active",
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({
      name: "", photo_url: "", primary_social: "tiktok", profile_url: "",
      description: "", category: "", promo_code: "", referral_link: "", verified: false, status: "active",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nom requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        display_order: editing?.display_order ?? influencers.length,
      };
      if (editing) {
        await base44.entities.MarketingInfluencer.update(editing.id, payload);
      } else {
        await base44.entities.MarketingInfluencer.create(payload);
      }
      toast({ title: editing ? "Influenceur modifié" : "Influenceur ajouté" });
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet influenceur ?")) return;
    try {
      await base44.entities.MarketingInfluencer.delete(id);
      toast({ title: "Influenceur supprimé" });
      onRefresh();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const toggleStatus = async (inf) => {
    const newStatus = inf.status === "active" ? "inactive" : "active";
    await base44.entities.MarketingInfluencer.update(inf.id, { status: newStatus });
    toast({ title: newStatus === "active" ? "Influenceur réactivé" : "Influenceur désactivé" });
    onRefresh();
  };

  // Compute stats per influencer
  const getInfluencerStats = (infId) => {
    const infAttributions = attributions.filter(a => a.influencer_id === infId);
    const userIds = new Set(infAttributions.map(a => a.user_id));
    const infUsers = users.filter(u => userIds.has(u.id));
    const activeUsers = infUsers.filter(u => u.account_status === "active").length;
    const infTxs = transactions.filter(t => userIds.has(t.created_by_id));
    const revenue = infTxs.reduce((sum, t) => sum + (t.amount_fcfa || 0), 0);
    const credits = infTxs.reduce((sum, t) => sum + (t.diamonds || 0), 0);
    const infGens = generations.filter(g => userIds.has(g.created_by_id)).length;
    return {
      signups: infAttributions.length,
      activeUsers,
      inactiveUsers: infUsers.length - activeUsers,
      revenue,
      credits,
      videos: infGens,
      retentionRate: infAttributions.length > 0 ? Math.round((activeUsers / infAttributions.length) * 100) : 0,
    };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Gestion des influenceurs ({influencers.length})</h2>
        <button
          onClick={startCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />Ajouter
        </button>
      </div>

      {influencers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun influenceur. Ajoutez-en un pour commencer.</p>
      ) : (
        <div className="space-y-2">
          {influencers.map(inf => {
            const stats = getInfluencerStats(inf.id);
            return (
              <div key={inf.id} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-start gap-3">
                  {inf.photo_url ? (
                    <img src={inf.photo_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                      {inf.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{inf.name}</span>
                      {inf.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${inf.status === "active" ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                        {inf.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {SOCIAL_OPTIONS.find(s => s.id === inf.primary_social)?.label || inf.primary_social}
                      {inf.category && ` · ${inf.category}`}
                      {inf.promo_code && ` · Code: ${inf.promo_code}`}
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap text-[10px] text-muted-foreground">
                      <span>👤 {stats.signups} inscriptions</span>
                      <span>🎬 {stats.videos} vidéos</span>
                      <span>💎 {stats.credits} diamants</span>
                      <span>💰 {stats.revenue.toLocaleString("fr-FR")} FCFA</span>
                      <span>📊 {stats.retentionRate}% rétention</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => toggleStatus(inf)} className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-white">
                      {inf.status === "active" ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => startEdit(inf)} className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-white">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(inf.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editing ? "Modifier l'influenceur" : "Nouvel influenceur"}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nom *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Réseau social *</label>
                  <select value={form.primary_social} onChange={e => setForm({ ...form, primary_social: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
                    {SOCIAL_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">URL Photo</label>
                <input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">URL du profil</label>
                <input value={form.profile_url} onChange={e => setForm({ ...form, profile_url: e.target.value })} placeholder="https://..." className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Catégorie</label>
                  <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Code promo</label>
                  <input value={form.promo_code} onChange={e => setForm({ ...form, promo_code: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Lien de parrainage</label>
                <input value={form.referral_link} onChange={e => setForm({ ...form, referral_link: e.target.value })} placeholder="https://..." className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input type="checkbox" checked={form.verified} onChange={e => setForm({ ...form, verified: e.target.checked })} className="accent-primary" />
                  Vérifié
                </label>
                <label className="flex items-center gap-2 text-sm text-white">
                  <input type="checkbox" checked={form.status === "active"} onChange={e => setForm({ ...form, status: e.target.checked ? "active" : "inactive" })} className="accent-primary" />
                  Actif
                </label>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}