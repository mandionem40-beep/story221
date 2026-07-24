import { useState, useEffect } from "react";
import { X, Save, Loader2, Replace, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PRESET_CATEGORIES } from "@/lib/ai-reference-categories";
import { toast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";

export default function AiReferenceDialog({ reference, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: reference.name || "",
    description: reference.description || "",
    tags: (reference.tags || []).join(", "),
    category: reference.category || "",
    media_url: reference.media_url || "",
    media_type: reference.media_type || "image",
    active: reference.active !== false,
  });

  const isVideo = form.media_type === "video" || (form.media_url && form.media_url.match(/\.(mp4|webm|mov|avi|mkv)$/i));

  const handleReplaceMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const mediaType = file.type?.startsWith("video") ? "video" : "image";
      setForm(prev => ({ ...prev, media_url: res.file_url, media_type: mediaType }));
      toast({ title: "Média remplacé" });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.name || !form.media_url || !form.category) {
      toast({ title: "Champs requis manquants", variant: "destructive" });
      return;
    }
    setSaving(true);
    const tags = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    await onSave(reference.id, {
      name: form.name,
      description: form.description,
      tags,
      category: form.category,
      media_url: form.media_url,
      media_type: form.media_type,
      active: form.active,
    });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white truncate">{form.name || "Référence"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Media preview */}
        <div className="relative aspect-video bg-secondary">
          {form.media_url ? (
            isVideo ? (
              <video src={form.media_url} controls className="w-full h-full object-contain" />
            ) : (
              <Image src={form.media_url} fittingType="fit" className="w-full h-full" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Aucun média</div>
          )}
          {editing && (
            <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Replace className="w-3 h-3" />}
              Remplacer
              <input type="file" accept="image/*,video/*" onChange={handleReplaceMedia} className="hidden" />
            </label>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {editing ? (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nom *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Catégorie *</label>
                <input list="ai-ref-categories" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Choisir ou créer une catégorie"
                  className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
                <datalist id="ai-ref-categories">
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Style, ambiance, composition, couleurs..."
                  className="w-full min-h-[80px] rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tags (séparés par virgules)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="sombre, cinématique, rouge, portrait"
                  className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
              </div>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-primary" />
                Actif (utilisé par le moteur IA)
              </label>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">{form.category || "—"}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${form.active ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                  {form.active ? "Actif" : "Inactif"}
                </span>
              </div>
              {form.description && <p className="text-sm text-muted-foreground">{form.description}</p>}
              {form.tags && form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.tags.split(",").map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">{t.trim()}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Ajouté par {reference.author_name || "Admin"} · {new Date(reference.created_date).toLocaleDateString("fr-FR")}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-4 border-t border-border">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
              <button onClick={() => setEditing(false)} className="px-4 h-9 rounded-lg bg-secondary text-muted-foreground text-sm font-medium">
                Annuler
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="flex-1 h-9 rounded-lg bg-secondary text-white text-sm font-semibold">
                Modifier
              </button>
              <button onClick={() => onDelete(reference.id)}
                className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}