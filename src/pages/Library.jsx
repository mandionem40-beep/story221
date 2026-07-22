import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Trash2, Copy, Sparkles, Film, Image as ImageIcon, Mic, BookOpen, UserCircle, Music } from "lucide-react";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";

const categories = [
  { id: "all", label: "Tous", types: null },
  { id: "video", label: "Vidéos", types: ["video", "film", "serie", "anime", "cartoon", "ad", "music_clip"] },
  { id: "image", label: "Images", types: ["image"] },
  { id: "character", label: "Personnages", types: ["character"] },
  { id: "story", label: "Histoires", types: ["story", "storyboard"] },
  { id: "voice", label: "Voix", types: ["voice"] },
];

export default function Library() {
  const { refreshUser, currentUser } = useOutletContext();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    setLoading(true);
    try {
      const gens = await base44.entities.Generation.filter({ created_by_id: currentUser?.id });
      setGenerations(gens || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const cat = categories.find(c => c.id === filter);
  const filtered = generations.filter(g => {
    if (g.status !== "completed" && g.status !== "processing") return false;
    if (cat?.types && !cat.types.includes(g.type)) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!g.title?.toLowerCase().includes(s) && !g.prompt?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const handleDelete = async (gen) => {
    if (!confirm("Supprimer définitivement cette création ?")) return;
    try {
      await base44.entities.Generation.delete(gen.id);
      setGenerations(generations.filter(g => g.id !== gen.id));
      setSelected(null);
      toast({ title: "Supprimé", description: "La création a été supprimée." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
    }
  };

  const handleDuplicate = async (gen) => {
    try {
      const { id, created_date, updated_date, created_by_id, ...data } = gen;
      await base44.entities.Generation.create({
        ...data,
        title: `${gen.title || "Copie"} (copie)`,
        status: "completed",
        is_published: false,
        reel_id: null,
      });
      toast({ title: "Dupliqué", description: "La création a été dupliquée." });
      loadGenerations();
    } catch {
      toast({ title: "Erreur", description: "Impossible de dupliquer.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-white mb-1">Bibliothèque</h1>
      <p className="text-sm text-muted-foreground mb-6">Toutes vos créations, organisées et accessibles.</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre ou mot-clé..."
          className="w-full h-11 rounded-xl bg-card border border-border pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === c.id ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-white font-medium mb-1">Aucune création</p>
          <p className="text-sm text-muted-foreground mb-4">Lancez votre première génération IA !</p>
          <Link to="/app/create" className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
            Créer
          </Link>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(gen => (
            <div
              key={gen.id}
              className="rounded-xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelected(gen)}
            >
              {gen.result_url ? (
                <div className="aspect-square bg-secondary">
                  {gen.result_type === "video" ? (
                    <video src={gen.result_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image src={gen.result_url} fittingType="fill" className="w-full h-full" />
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="p-2.5">
                <p className="text-xs font-medium text-white truncate">{gen.title || gen.prompt?.substring(0, 30)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground capitalize">{gen.type}</span>
                  {gen.is_published && <span className="text-[10px] text-green-500">Publié</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {selected.result_url && (
              <div className="bg-black rounded-t-2xl overflow-hidden">
                {selected.result_type === "video" ? (
                  <video src={selected.result_url} controls className="w-full max-h-[300px]" />
                ) : selected.result_type === "audio" ? (
                  <div className="p-6"><audio src={selected.result_url} controls className="w-full" /></div>
                ) : (
                  <Image src={selected.result_url} fittingType="fit" className="w-full max-h-[300px]" />
                )}
              </div>
            )}
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-1">{selected.title || "Création"}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selected.type} · {selected.duration_minutes} min · {selected.language}
              </p>
              {selected.prompt && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                  <p className="text-sm text-white">{selected.prompt}</p>
                </div>
              )}
              {selected.enhanced_script && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Script</p>
                  <p className="text-sm text-white whitespace-pre-wrap">{selected.enhanced_script.substring(0, 500)}...</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleDuplicate(selected)} className="flex-1 py-2.5 rounded-lg bg-secondary text-white text-sm font-medium flex items-center justify-center gap-1.5">
                  <Copy className="w-4 h-4" /> Dupliquer
                </button>
                <button onClick={() => handleDelete(selected)} className="flex-1 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-1.5">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}