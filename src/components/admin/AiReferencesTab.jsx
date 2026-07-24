import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { PRESET_CATEGORIES } from "@/lib/ai-reference-categories";
import { Library, Plus, Search, Loader2, Upload, ImageIcon, VideoIcon, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import AiReferenceDialog from "./AiReferenceDialog";

export default function AiReferencesTab() {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", tags: "", category: "", media_url: "", media_type: "image" });
  const fileInputRef = useRef(null);

  useEffect(() => { loadReferences(); }, []);

  const loadReferences = async () => {
    setLoading(true);
    try {
      const refs = await base44.entities.AIReference.list("-created_date", 500);
      setReferences(refs || []);
    } catch {
      toast({ title: "Erreur de chargement", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleQuickUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const created = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        const mediaType = file.type?.startsWith("video") ? "video" : "image";
        const name = file.name.replace(/\.[^.]+$/, "").substring(0, 60);
        const ref = await base44.entities.AIReference.create({
          name,
          media_url: res.file_url,
          media_type: mediaType,
          category: "",
          active: true,
        });
        created.push(ref);
      }
      setReferences(prev => [...created, ...prev]);
      toast({ title: `${created.length} référence(s) ajoutée(s)` });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleAddWithDetails = async () => {
    if (!newItem.name || !newItem.media_url || !newItem.category) {
      toast({ title: "Nom, catégorie et média requis", variant: "destructive" });
      return;
    }
    try {
      const tags = newItem.tags ? newItem.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      const ref = await base44.entities.AIReference.create({
        name: newItem.name,
        description: newItem.description,
        tags,
        category: newItem.category,
        media_url: newItem.media_url,
        media_type: newItem.media_type,
        active: true,
      });
      setReferences(prev => [ref, ...prev]);
      setNewItem({ name: "", description: "", tags: "", category: "", media_url: "", media_type: "image" });
      setShowAdd(false);
      toast({ title: "Référence ajoutée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleUploadForAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const mediaType = file.type?.startsWith("video") ? "video" : "image";
      setNewItem(prev => ({ ...prev, media_url: res.file_url, media_type: mediaType, name: prev.name || file.name.replace(/\.[^.]+$/, "").substring(0, 60) }));
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async (id, data) => {
    try {
      await base44.entities.AIReference.update(id, data);
      setReferences(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      setSelected(null);
      toast({ title: "Référence mise à jour" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette référence ?")) return;
    try {
      await base44.entities.AIReference.delete(id);
      setReferences(prev => prev.filter(r => r.id !== id));
      setSelected(null);
      toast({ title: "Référence supprimée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleToggle = async (ref) => {
    try {
      await base44.entities.AIReference.update(ref.id, { active: !ref.active });
      setReferences(prev => prev.map(r => r.id === ref.id ? { ...r, active: !ref.active } : r));
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  // Build dynamic category list (presets + custom from data)
  const allCategories = [...new Set([
    ...PRESET_CATEGORIES,
    ...references.map(r => r.category).filter(Boolean),
  ])];

  // Filter
  const filtered = references.filter(r => {
    const matchSearch = !search || 
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      (r.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !categoryFilter || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total: references.length,
    active: references.filter(r => r.active).length,
    inactive: references.filter(r => !r.active).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Library className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-white">Bibliothèque de Références IA</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Images et vidéos de référence pour guider les modèles IA et améliorer la cohérence visuelle des générations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Actives</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.inactive}</p>
          <p className="text-xs text-muted-foreground">Inactives</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, tag, description..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-background border border-border text-sm text-white" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white min-w-[160px]">
          <option value="">Toutes les catégories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)}
          className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
        <label className="h-10 px-4 rounded-lg bg-secondary border border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:text-white whitespace-nowrap">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Importer
          <input type="file" accept="image/*,video/*" multiple onChange={handleQuickUpload} className="hidden" />
        </label>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Nouvelle référence</h3>
            <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Nom *"
              className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
            <input list="ai-ref-cat-add" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="Catégorie *"
              className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
            <datalist id="ai-ref-cat-add">{PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description (style, ambiance, couleurs...)"
            className="w-full min-h-[60px] rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-none" />
          <input value={newItem.tags} onChange={e => setNewItem({ ...newItem, tags: e.target.value })} placeholder="Tags séparés par virgules"
            className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
          <div className="flex items-center gap-3">
            {newItem.media_url ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-secondary">
                {newItem.media_type === "video" ? (
                  <video src={newItem.media_url} className="w-full h-full object-cover" />
                ) : (
                  <Image src={newItem.media_url} fittingType="fill" className="w-full h-full" />
                )}
              </div>
            ) : null}
            <label className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground flex items-center gap-1.5 cursor-pointer hover:text-white">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {newItem.media_url ? "Changer le média" : "Uploader un média *"}
              <input type="file" accept="image/*,video/*" onChange={handleUploadForAdd} className="hidden" />
            </label>
            <button onClick={handleAddWithDetails} disabled={!newItem.name || !newItem.media_url || !newItem.category}
              className="ml-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-30">
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Library className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune référence. Importez des images ou vidéos pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(ref => {
            const isVideo = ref.media_type === "video" || (ref.media_url && ref.media_url.match(/\.(mp4|webm|mov|avi|mkv)$/i));
            return (
              <div key={ref.id} className="group relative rounded-xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelected(ref)}>
                <div className="relative aspect-square bg-secondary">
                  {ref.media_url ? (
                    isVideo ? (
                      <video src={ref.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <Image src={ref.media_url} fittingType="fill" className="w-full h-full" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground" /></div>
                  )}
                  {!ref.active && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">Inactif</span>
                    </div>
                  )}
                  {isVideo && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                      <VideoIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-white truncate">{ref.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-primary truncate">{ref.category || "—"}</span>
                  </div>
                </div>
                {/* Quick toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(ref); }}
                  className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    ref.active ? "bg-green-500/90 text-white" : "bg-yellow-500/90 text-black"
                  }`}>
                  {ref.active ? "✓" : "⊘"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview / Edit Dialog */}
      {selected && (
        <AiReferenceDialog
          reference={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}