import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, FileText, Loader2, X, Pencil, Copy, Mail, MessageCircle, Megaphone, LayoutGrid } from "lucide-react";

const CHANNEL_CONFIG = {
  email: { label: "Email", icon: Mail, color: "bg-blue-500/10 text-blue-400" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "bg-green-500/10 text-green-400" },
  in_app: { label: "In-App", icon: Megaphone, color: "bg-primary/10 text-primary" },
  all: { label: "Tous canaux", icon: LayoutGrid, color: "bg-purple-500/10 text-purple-400" },
};

export default function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", content: "", channel: "all" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      setTemplates(await base44.entities.MessageTemplate.list("-created_date", 500));
    } catch { /* ignore */ }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", content: "", channel: "all" });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, content: t.content, channel: t.channel || "all" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.MessageTemplate.update(editing.id, form);
        toast({ title: "Modèle mis à jour" });
      } else {
        await base44.entities.MessageTemplate.create(form);
        toast({ title: "Modèle créé" });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", content: "", channel: "all" });
      load();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le modèle.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce modèle ?")) return;
    try {
      await base44.entities.MessageTemplate.delete(id);
      load();
      toast({ title: "Modèle supprimé" });
    } catch {
      toast({ title: "Erreur", description: "Suppression impossible.", variant: "destructive" });
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Contenu copié" });
  };

  const filtered = templates.filter((t) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || t.name?.toLowerCase().includes(q) || t.content?.toLowerCase().includes(q);
    const matchesChannel = channelFilter === "all" || t.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Enregistrez des modèles réutilisables pour vos campagnes Email, WhatsApp et In-App</p>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">
          <Plus className="w-4 h-4" />Nouveau modèle
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un modèle..." className="w-full h-10 px-3 rounded-lg bg-card border border-border text-sm text-white" />
        </div>
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-white">
          <option value="all">Tous les canaux</option>
          {Object.entries(CHANNEL_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun modèle enregistré. Créez votre premier modèle pour gagner du temps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((t) => {
            const cfg = CHANNEL_CONFIG[t.channel] || CHANNEL_CONFIG.all;
            return (
              <div key={t.id} className="rounded-xl bg-card border border-border p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <cfg.icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{t.name}</h3>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4 flex-1 whitespace-pre-wrap">{t.content}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] text-muted-foreground flex-1">{new Date(t.created_date).toLocaleDateString("fr-FR")}</span>
                  <button onClick={() => handleCopy(t.content)} className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center hover:text-white" title="Copier">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center hover:text-white" title="Modifier">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center" title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{editing ? "Modifier le modèle" : "Nouveau modèle"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Nom du modèle</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Relance inactifs" className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Canal</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(CHANNEL_CONFIG).map(([val, cfg]) => (
                    <button key={val} type="button" onClick={() => setForm({ ...form, channel: val })} className={`h-9 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${form.channel === val ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                      <cfg.icon className="w-3 h-3" />{cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Contenu</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Contenu du message..." rows={6} className="w-full rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-white resize-none outline-none" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.content.length} caractères</p>
              </div>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.content.trim() || saving} className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? "Enregistrer" : "Créer le modèle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}