import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { Send, Settings, Gift, Sparkles, ChevronDown, ImagePlus, X, Loader2 } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { contentTypes, calculateCost, styles, languages } from "@/lib/generation-utils";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const MAX_IMAGES = 10;

export default function Home() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("video");
  const [duration, setDuration] = useState(1);
  const [language, setLanguage] = useState("Français");
  const [style, setStyle] = useState(styles[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [recentGens, setRecentGens] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const gens = await base44.entities.Generation.filter(
          { created_by_id: currentUser?.id },
          "-created_date",
          4
        );
        setRecentGens(gens || []);
      } catch { /* empty state is fine */ }
    };
    loadRecent();
  }, [currentUser]);

  const config = contentTypes.find(t => t.id === type) || contentTypes[0];
  const cost = calculateCost(type, duration);
  const diamonds = currentUser?.diamonds ?? 0;
  const freeTrialAvailable = !currentUser?.free_trial_used;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - uploadedImages.length;
    if (remaining <= 0) return;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const results = await Promise.all(
        toUpload.map((file) => base44.integrations.Core.UploadFile({ file }))
      );
      setUploadedImages((prev) => [...prev, ...results.map((r) => r.file_url)]);
    } catch { /* ignore */ }
    setUploading(false);
    e.target.value = "";
  };

  const handleRemoveImage = (idx) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("prompt", prompt.trim());
    if (config.costType === "per_minute") params.set("duration", duration);
    params.set("style", style);
    params.set("language", language);
    if (uploadedImages.length > 0) {
      sessionStorage.setItem("pending_reference_images", JSON.stringify(uploadedImages));
    } else {
      sessionStorage.removeItem("pending_reference_images");
    }
    navigate(`/app/create?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Bonjour, <span className="gradient-text-red">{currentUser?.username || currentUser?.full_name || "créateur"}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Décrivez votre idée, l'IA s'occupe du reste.</p>
      </div>

      {/* Balance badges */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
          <DiamondIcon className="w-4 h-4" />
          <span className="text-sm font-semibold text-white">{diamonds}</span>
        </div>
        {freeTrialAvailable && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Essai gratuit</span>
          </div>
        )}
      </div>

      {/* Chat / Prompt box */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden mb-3 focus-within:border-primary/40 transition-colors">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Une fraise en or appelée Mandione tombe amoureuse d'une fraise en argent appelée Yama..."
          className="w-full min-h-[120px] bg-transparent p-4 text-sm text-white placeholder:text-muted-foreground/50 resize-none border-none outline-none"
          autoFocus
        />

        {/* Uploaded images preview + upload zone */}
        {(uploadedImages.length > 0 || uploading) && (
          <div className="flex gap-2 px-3 pt-3 overflow-x-auto scrollbar-hide">
            {uploadedImages.map((url, idx) => (
              <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border group">
                <Image src={url} fittingType="fill" className="w-full h-full" />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {uploading && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg border border-dashed border-primary/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Settings bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border overflow-x-auto scrollbar-hide">
          {/* Type selector */}
          <div className="relative flex-shrink-0">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="appearance-none pl-8 pr-7 h-9 rounded-lg bg-secondary border border-border text-xs font-medium text-white cursor-pointer"
            >
              {contentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <config.icon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Duration (for per_minute types) */}
          {config.costType === "per_minute" && (
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-secondary border border-border flex-shrink-0">
              <span className="text-xs text-muted-foreground">Durée</span>
              <input
                type="range"
                min="1"
                max="10"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-14 accent-primary"
              />
              <span className="text-xs font-medium text-white">{duration}min</span>
            </div>
          )}

          {/* Language */}
          <div className="relative flex-shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none px-3 pr-7 h-9 rounded-lg bg-secondary border border-border text-xs font-medium text-white cursor-pointer"
            >
              {languages.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* More settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border transition-colors flex-shrink-0 ${
              showSettings ? "bg-primary/20 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Réglages</span>
          </button>

          {/* Image upload */}
          <label className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border transition-colors flex-shrink-0 cursor-pointer ${
            uploadedImages.length >= MAX_IMAGES ? "bg-secondary border-border text-muted-foreground/50 cursor-not-allowed" : "bg-secondary border-border text-muted-foreground hover:text-white"
          }`}>
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImagePlus className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-medium">{uploadedImages.length}/{MAX_IMAGES}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading || uploadedImages.length >= MAX_IMAGES}
              className="hidden"
            />
          </label>

          {/* Cost indicator */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <DiamondIcon className="w-4 h-4" />
            <span className="text-sm font-bold text-white">{cost}</span>
          </div>
        </div>

        {/* Expanded settings */}
        {showSettings && (
          <div className="px-3 py-3 border-t border-border">
            <label className="text-xs text-muted-foreground mb-1.5 block">Style visuel</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-9 rounded-lg bg-secondary border border-border px-3 text-xs text-white">
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-red-sm"
      >
        <Send className="w-4 h-4" />
        {prompt.trim() ? <span className="flex items-center gap-1.5">Générer ({cost}) <DiamondIcon className="w-4 h-4" /></span> : "Tapez votre idée..."}
      </button>

      {/* Quick type grid */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Types de création</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {contentTypes.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                type === t.id ? "bg-primary/10 border-primary/40" : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                <t.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-medium text-white text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent creations */}
      {recentGens.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Créations récentes</h3>
            <Link to="/app/library" className="text-sm text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentGens.map(gen => (
              <Link
                key={gen.id}
                to="/app/library"
                className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                {gen.result_url ? (
                  <div className="aspect-video bg-secondary">
                    <Image src={gen.result_url} fittingType="fill" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-white truncate">{gen.title || gen.prompt?.substring(0, 30)}</p>
                  <p className="text-[10px] text-muted-foreground">{gen.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}