import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, MapPin, CheckCircle, XCircle, Search, Save, Building2, Bus, Train, Landmark } from "lucide-react";

const CATEGORY_ICONS = {
  transport: Bus,
  monument: Landmark,
  city: Building2,
  neighborhood: Building2,
  infrastructure: Building2,
  natural: MapPin,
  other: MapPin,
};

const CATEGORY_LABELS = {
  transport: "Transport",
  monument: "Monument",
  city: "Ville",
  neighborhood: "Quartier",
  infrastructure: "Infrastructure",
  natural: "Site naturel",
  other: "Autre",
};

export default function PlacesTab() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: "",
    category: "monument",
    visual_description: "",
    keywords: "",
    location: "",
  });

  useEffect(() => { loadPlaces(); }, []);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const items = await base44.entities.PlaceReference.list("display_order", 200);
      setPlaces(items || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les lieux.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPlace.name || !newPlace.visual_description) {
      toast({ title: "Champs requis", description: "Nom et description visuelle sont obligatoires.", variant: "destructive" });
      return;
    }
    const keywords = newPlace.keywords
      ? newPlace.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean)
      : [];
    if (keywords.length === 0) {
      toast({ title: "Mots-clés requis", description: "Ajoutez au moins un mot-clé de détection.", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.PlaceReference.create({
        name: newPlace.name,
        category: newPlace.category,
        visual_description: newPlace.visual_description,
        keywords,
        location: newPlace.location,
        verified: false,
        active: false,
        display_order: (places.length || 0) + 1,
      });
      toast({ title: "Lieu ajouté", description: "Vérifiez visuellement avant d'activer." });
      setNewPlace({ name: "", category: "monument", visual_description: "", keywords: "", location: "" });
      setShowForm(false);
      loadPlaces();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleToggleVerified = async (place) => {
    const newVerified = !place.verified;
    try {
      await base44.entities.PlaceReference.update(place.id, {
        verified: newVerified,
        verified_at: newVerified ? new Date().toISOString() : null,
        active: newVerified && place.active,
      });
      toast({ title: newVerified ? "Lieu vérifié" : "Vérification retirée" });
      loadPlaces();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleToggleActive = async (place) => {
    if (!place.verified && !place.active) {
      toast({ title: "Non vérifié", description: "Vérifiez visuellement ce lieu avant de l'activer.", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.PlaceReference.update(place.id, { active: !place.active });
      toast({ title: place.active ? "Lieu désactivé" : "Lieu activé" });
      loadPlaces();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleSave = async (place, edited) => {
    try {
      const keywords = typeof edited.keywords === "string"
        ? edited.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean)
        : edited.keywords || [];
      await base44.entities.PlaceReference.update(place.id, {
        name: edited.name,
        visual_description: edited.visual_description,
        location: edited.location,
        keywords,
      });
      toast({ title: "Lieu mis à jour" });
      loadPlaces();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce lieu ?")) return;
    try {
      await base44.entities.PlaceReference.delete(id);
      toast({ title: "Lieu supprimé" });
      loadPlaces();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const filtered = places.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) || (p.keywords || []).some((k) => k.includes(q));
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Lieux Réels — Fidélité Visuelle
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Fiches de référence visuelle vérifiées. Quand un utilisateur mentionne un lieu dans son prompt, le moteur injecte ces caractéristiques vérifiées pour garantir un rendu fidèle. ⚠️ Un lieu ne devient actif qu'après vérification visuelle.
      </p>

      {showForm && (
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Nouveau lieu réel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={newPlace.name} onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })} placeholder="Nom officiel (ex: Monument de la Renaissance)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
            <select value={newPlace.category} onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })} className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <input value={newPlace.location} onChange={(e) => setNewPlace({ ...newPlace, location: e.target.value })} placeholder="Localisation (ex: Dakar, Yoff)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
            <input value={newPlace.keywords} onChange={(e) => setNewPlace({ ...newPlace, keywords: e.target.value })} placeholder="Mots-clés séparés par virgules (ex: brt, bus rapid, busway)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
          </div>
          <textarea value={newPlace.visual_description} onChange={(e) => setNewPlace({ ...newPlace, visual_description: e.target.value })} placeholder="Caractéristiques visuelles vérifiées: forme, couleurs, architecture, matériaux, environnement, ambiance lumineuse..." rows={4} className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-none mb-3" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un lieu..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-white" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun lieu enregistré.</p>
        ) : (
          filtered.map((place) => (
            <PlaceEditor key={place.id} place={place} onSave={handleSave} onToggleVerified={handleToggleVerified} onToggleActive={handleToggleActive} onDelete={handleDelete} />
          ))
        )}
      </div>

      <div className="mt-6 rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-yellow-400">Règle de production:</strong> chaque lieu doit être vérifié visuellement contre des références réelles avant activation. Un lieu non vérifié ne sera jamais injecté dans les générations. Les infrastructures de transport (BRT, TER, cars rapides) peuvent être représentées fidèlement dans un contenu narratif, mais le logo officiel exact d'un opérateur commercial ne doit jamais être apposé sans visuels de marque autorisés fournis par l'utilisateur.
        </p>
      </div>
    </div>
  );
}

function PlaceEditor({ place, onSave, onToggleVerified, onToggleActive, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState({
    name: place.name,
    visual_description: place.visual_description,
    location: place.location || "",
    keywords: (place.keywords || []).join(", "),
  });

  const Icon = CATEGORY_ICONS[place.category] || MapPin;

  if (!editing) {
    return (
      <div className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${place.active ? "bg-primary/10" : "bg-secondary"}`}>
            <Icon className={`w-4 h-4 ${place.active ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">{place.name}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{CATEGORY_LABELS[place.category]}</span>
              {place.location && <span className="text-[10px] text-muted-foreground">📍 {place.location}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{place.visual_description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(place.keywords || []).map((kw, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">#{kw}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <div className="flex gap-1.5">
              <button onClick={() => onToggleVerified(place)} className={`px-2 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 ${place.verified ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                {place.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {place.verified ? "Vérifié" : "Non vérifié"}
              </button>
              <button onClick={() => onToggleActive(place)} disabled={!place.verified && !place.active} className={`px-2 py-1 rounded-lg text-[10px] font-medium disabled:opacity-30 ${place.active ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {place.active ? "Actif" : "Inactif"}
              </button>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setEditing(true)} className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground text-[10px] font-medium">Modifier</button>
              <button onClick={() => onDelete(place.id)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-primary/30 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input value={edited.name} onChange={(e) => setEdited({ ...edited, name: e.target.value })} placeholder="Nom" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
        <input value={edited.location} onChange={(e) => setEdited({ ...edited, location: e.target.value })} placeholder="Localisation" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
      </div>
      <textarea value={edited.visual_description} onChange={(e) => setEdited({ ...edited, visual_description: e.target.value })} placeholder="Description visuelle vérifiée" rows={4} className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-none mb-3" />
      <input value={edited.keywords} onChange={(e) => setEdited({ ...edited, keywords: e.target.value })} placeholder="Mots-clés (séparés par virgules)" className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm text-white mb-3" />
      <div className="flex gap-2">
        <button onClick={() => { onSave(place, edited); setEditing(false); }} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-1.5">
          <Save className="w-4 h-4" /> Enregistrer
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium">Annuler</button>
      </div>
    </div>
  );
}