import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const NETWORK_OPTIONS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "snapchat", label: "Snapchat" },
  { id: "youtube", label: "YouTube" },
];

const NETWORK_LABELS = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", snapchat: "Snapchat", youtube: "YouTube",
};

export default function InfluencerManager({ influencers, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", photo_url: "", primary_social: "tiktok", status: "active",
  });

  const startEdit = (inf) => {
    setEditing(inf);
    setForm({
      name: inf.name || "",
      photo_url: inf.photo_url || "",
      primary_social: inf.primary_social || "tiktok",
      status: inf.status || "active",
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", photo_url: "", primary_social: "tiktok", status: "active" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nom requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, display_order: editing?.display_order ?? influencers.length };
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Gestion des influenceurs</h3>
        <button onClick={startCreate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
          <Plus className="w-4 h-4" />Ajouter
        </button>
      </div>

      {influencers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun influenceur. Ajoutez-en un pour commencer.</p>
      ) : (
        <div className="space-y-2">
          {influencers.map(inf => (
            <div key={inf.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {inf.photo_url ? (
                <img src={inf.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  {inf.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white block truncate">{inf.name}</span>
                <span className="text-[10px] text-muted-foreground">{NETWORK_LABELS[inf.primary_social] || inf.primary_social}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${inf.status === "active" ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                {inf.status === "active" ? "Actif" : "Inactif"}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleStatus(inf)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] text-muted-foreground hover:text-white">
                  {inf.status === "active" ? "Désactiver" : "Activer"}
                </button>
                <button onClick={() => startEdit(inf)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] text-muted-foreground hover:text-white">
                  Modifier
                </button>
                <button onClick={() => handleDelete(inf.id)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editing ? "Modifier l'influenceur" : "Nouvel influenceur"}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nom *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Réseau social *</label>
                <select value={form.primary_social} onChange={e => setForm({ ...form, primary_social: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
                  {NETWORK_OPTIONS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">URL Photo</label>
                <input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Statut</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
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