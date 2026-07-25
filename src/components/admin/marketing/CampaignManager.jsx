import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const NETWORK_OPTIONS = [
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "snapchat", label: "Snapchat" },
  { id: "google", label: "Google" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "other", label: "Autre" },
];

export default function CampaignManager({ campaigns, onRefresh, attributions }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", network: "tiktok", budget_fcfa: 0, start_date: "", end_date: "",
    status: "active", cost_per_acquisition_fcfa: 0, description: "",
  });

  const startEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "", network: c.network || "tiktok", budget_fcfa: c.budget_fcfa || 0,
      start_date: c.start_date || "", end_date: c.end_date || "", status: c.status || "active",
      cost_per_acquisition_fcfa: c.cost_per_acquisition_fcfa || 0, description: c.description || "",
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({
      name: "", network: "tiktok", budget_fcfa: 0, start_date: "", end_date: "",
      status: "active", cost_per_acquisition_fcfa: 0, description: "",
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
      if (editing) {
        await base44.entities.MarketingCampaign.update(editing.id, form);
      } else {
        await base44.entities.MarketingCampaign.create(form);
      }
      toast({ title: editing ? "Campagne modifiée" : "Campagne créée" });
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    try {
      await base44.entities.MarketingCampaign.delete(id);
      toast({ title: "Campagne supprimée" });
      onRefresh();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const getCampaignStats = (campaignId) => {
    const matches = attributions.filter(a => a.campaign_id === campaignId);
    return { signups: matches.length };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Campagnes Marketing ({campaigns.length})</h2>
        <button onClick={startCreate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
          <Plus className="w-4 h-4" />Créer
        </button>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune campagne. Créez-en une pour suivre vos publicités.</p>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => {
            const stats = getCampaignStats(c.id);
            const budget = c.budget_fcfa || 0;
            const cpa = c.cost_per_acquisition_fcfa || 0;
            const roi = stats.signups > 0 && budget > 0 ? Math.round(((stats.signups * cpa) / budget) * 100) : 0;
            return (
              <div key={c.id} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{c.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/15 text-[10px] font-medium text-primary">
                        {NETWORK_OPTIONS.find(n => n.id === c.network)?.label || c.network}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${c.status === "active" ? "bg-green-500/20 text-green-400" : c.status === "paused" ? "bg-yellow-500/20 text-yellow-400" : "bg-secondary text-muted-foreground"}`}>
                        {c.status === "active" ? "Active" : c.status === "paused" ? "En pause" : "Terminée"}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-2 flex-wrap text-[10px] text-muted-foreground">
                      <span>💰 Budget: {(c.budget_fcfa || 0).toLocaleString("fr-FR")} FCFA</span>
                      <span>👤 {stats.signups} inscriptions</span>
                      {c.start_date && <span>📅 {new Date(c.start_date).toLocaleDateString("fr-FR")}</span>}
                      {c.end_date && <span>→ {new Date(c.end_date).toLocaleDateString("fr-FR")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(c)} className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-white">Modifier</button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editing ? "Modifier la campagne" : "Nouvelle campagne"}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nom *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Réseau *</label>
                  <select value={form.network} onChange={e => setForm({ ...form, network: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
                    {NETWORK_OPTIONS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Budget (FCFA)</label>
                  <input type="number" value={form.budget_fcfa} onChange={e => setForm({ ...form, budget_fcfa: parseInt(e.target.value) || 0 })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Coût par acquisition (FCFA)</label>
                  <input type="number" value={form.cost_per_acquisition_fcfa} onChange={e => setForm({ ...form, cost_per_acquisition_fcfa: parseInt(e.target.value) || 0 })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date de début</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date de fin</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Statut</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
                  <option value="active">Active</option>
                  <option value="paused">En pause</option>
                  <option value="ended">Terminée</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}