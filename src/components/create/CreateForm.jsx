import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2, Diamond, Gift, AlertCircle } from "lucide-react";
import { styles, formats, voices, musics, resolutions, languages, adSectors, calculateCost, getContentType } from "@/lib/generation-utils";
import { base44 } from "@/api/base44Client";

export default function CreateForm({ type, onTypeChange, user, onSubmit }) {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(1);
  const [style, setStyle] = useState(styles[0]);
  const [format, setFormat] = useState("vertical");
  const [voice, setVoice] = useState("river");
  const [music, setMusic] = useState(musics[0]);
  const [resolution, setResolution] = useState("720p");
  const [language, setLanguage] = useState("Français");
  const [adSector, setAdSector] = useState(adSectors[0].id);
  const [adBrandName, setAdBrandName] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [adLogoUrl, setAdLogoUrl] = useState("");
  const [adColors, setAdColors] = useState("");
  const [adPrivateUse, setAdPrivateUse] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const config = getContentType(type);
  const cost = calculateCost(type, duration);
  const diamonds = user?.diamonds ?? 0;
  const freeTrialAvailable = !user?.free_trial_used;
  const canAfford = diamonds >= cost;
  const canUseFreeTrial = freeTrialAvailable && cost > 0;

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setAdLogoUrl(result.file_url);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setSubmitting(true);
    await onSubmit({
      prompt: prompt.trim(),
      type,
      options: {
        duration, style, format, voice, music, resolution, language,
        adSector, adBrandName, adMessage, adLogoUrl, adColors, adPrivateUse,
      },
    });
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Type de création</Label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-white"
        >
          {["video","image","film","serie","anime","cartoon","ad","storyboard","story","music_clip","voice","character"].map(t => {
            const c = getContentType(t);
            return <option key={t} value={t}>{c.label}</option>;
          })}
        </select>
      </div>

      {/* Prompt */}
      <div>
        <Label htmlFor="prompt" className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Votre idée</Label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Une fraise en or appelée Mandione tombe amoureuse d'une fraise en argent appelée Yama..."
          className="w-full min-h-[100px] rounded-xl bg-card border border-border p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-y"
          rows={4}
        />
      </div>

      {/* Duration (for per_minute types) */}
      {config.costType === "per_minute" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Durée</Label>
            <span className="text-sm font-semibold text-white">{duration} min</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([v]) => setDuration(v)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>1 min</span><span>5 min</span><span>10 min</span>
          </div>
        </div>
      )}

      {/* Language */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Langue</Label>
        <div className="flex gap-2 flex-wrap">
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                language === lang.id ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-white"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Style visuel</Label>
        <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-white">
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Format */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Format</Label>
        <div className="grid grid-cols-3 gap-2">
          {formats.map(f => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-2 rounded-lg text-center transition-colors ${
                format === f.id ? "bg-primary/20 border border-primary/40" : "bg-card border border-border"
              }`}
            >
              <p className="text-xs font-medium text-white">{f.label.split(" ")[0]}</p>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Voice (for types with voice) */}
      {["video","film","serie","anime","cartoon","ad","music_clip","voice"].includes(type) && (
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Voix</Label>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-white">
            {voices.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
      )}

      {/* Music */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Musique</Label>
        <select value={music} onChange={(e) => setMusic(e.target.value)} className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-white">
          {musics.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Resolution */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Résolution</Label>
        <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-white">
          {resolutions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Ad-specific fields */}
      {type === "ad" && (
        <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
          <p className="text-sm font-semibold text-primary">Options Publicité</p>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Secteur</Label>
            <select value={adSector} onChange={(e) => setAdSector(e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border px-3 text-sm text-white">
              {adSectors.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Nom de la marque</Label>
            <input value={adBrandName} onChange={(e) => setAdBrandName(e.target.value)} placeholder="Votre marque" className="w-full h-11 rounded-xl bg-background border border-border px-3 text-sm text-white" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Message principal</Label>
            <textarea value={adMessage} onChange={(e) => setAdMessage(e.target.value)} placeholder="Le message de votre publicité" className="w-full min-h-[60px] rounded-xl bg-background border border-border p-3 text-sm text-white resize-y" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Logo</Label>
            <label className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border cursor-pointer hover:border-primary/30 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{adLogoUrl ? "Logo téléversé ✓" : "Téléverser un logo"}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Couleurs de marque</Label>
            <input value={adColors} onChange={(e) => setAdColors(e.target.value)} placeholder="ex: rouge, noir, blanc" className="w-full h-11 rounded-xl bg-background border border-border px-3 text-sm text-white" />
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm text-white">Usage commercial privé</p>
              <p className="text-xs text-muted-foreground">Téléchargement direct sans Reels</p>
            </div>
            <Switch checked={adPrivateUse} onCheckedChange={setAdPrivateUse} />
          </div>
        </div>
      )}

      {/* Cost + Balance */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Coût</span>
          <div className="flex items-center gap-1.5">
            <Diamond className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="text-lg font-bold text-white">{cost}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Votre solde</span>
          <span className={`font-semibold ${canAfford ? "text-white" : "text-destructive"}`}>{diamonds} 💎</span>
        </div>
        {canUseFreeTrial && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Essai gratuit disponible — cette génération sera gratuite !</span>
          </div>
        )}
        {!canAfford && !canUseFreeTrial && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive">Solde insuffisant — achetez des diamants</span>
          </div>
        )}
      </div>

      {/* Generate button */}
      <Button
        onClick={handleSubmit}
        disabled={!prompt.trim() || submitting || uploading || (!canAfford && !canUseFreeTrial)}
        className="w-full h-12 font-semibold text-base"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Lancement...</>
        ) : (
          `Générer (${cost} 💎)`
        )}
      </Button>
    </div>
  );
}