import { ChevronLeft, ChevronRight, Play, Volume2 } from "lucide-react";
import { quickDurations, quickVoices, quickLanguages, quickMusics, quickFormats } from "@/lib/quick-create-data";
import { videoEngines } from "@/lib/generation-utils";
import DiamondIcon from "@/components/DiamondIcon";

export default function SettingsStep({ settings, onChange, onNext, onBack, diamonds }) {
  const update = (patch) => onChange({ ...settings, ...patch });

  const previewVoice = (voice) => {
    const lang = quickLanguages.find(l => l.id === settings.language);
    const text = lang?.sample || "Bonjour, je suis votre narrateur.";
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Réglages rapides</h2>
          <p className="text-xs text-muted-foreground">Derniers choix avant la magie</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Durée</label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {quickDurations.map(d => (
            <button
              key={d.id}
              onClick={() => update({ duration: d })}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border transition-all ${
                settings.duration.id === d.id ? "bg-primary/10 border-primary/40" : "bg-card border-border"
              }`}
            >
              <span className="text-sm font-bold text-white">{d.label}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-primary">
                <DiamondIcon className="w-3 h-3" />{d.cost}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Video engine */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Moteur de génération vidéo</label>
        <div className="grid grid-cols-2 gap-2">
          {videoEngines.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => update({ engine: e.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                (settings.engine || "gemini") === e.id ? "bg-primary/10 border-primary/40" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{e.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-primary font-semibold">×{e.multiplier}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{e.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Langue</label>
        <div className="flex gap-2">
          {quickLanguages.map(l => (
            <button
              key={l.id}
              onClick={() => update({ language: l.id })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                settings.language === l.id ? "bg-primary/10 border-primary/40 text-white" : "bg-card border-border text-muted-foreground"
              }`}
            >
              <span className="text-base">{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Voix</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickVoices.map(v => (
            <div
              key={v.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                settings.voice === v.id ? "bg-primary/10 border-primary/40" : "bg-card border-border"
              }`}
            >
              <button onClick={() => update({ voice: v.id })} className="flex-1 flex flex-col items-start text-left">
                <span className="text-sm font-medium text-white">{v.label}</span>
                <span className="text-[10px] text-muted-foreground">{v.desc}</span>
              </button>
              <button
                onClick={() => previewVoice(v)}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Écouter un extrait"
              >
                <Volume2 className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Music */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Musique d'ambiance</label>
        <div className="flex flex-wrap gap-2">
          {quickMusics.map(m => (
            <button
              key={m.id}
              onClick={() => update({ music: m.id })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                settings.music === m.id ? "bg-primary/10 border-primary/40 text-white" : "bg-card border-border text-muted-foreground"
              }`}
            >
              <span className="text-base">{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Format</label>
        <div className="grid grid-cols-3 gap-2">
          {quickFormats.map(f => (
            <button
              key={f.id}
              onClick={() => update({ format: f.id })}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                settings.format === f.id ? "bg-primary/10 border-primary/40" : "bg-card border-border"
              }`}
            >
              <div className={`bg-secondary rounded ${f.id === "vertical" ? "w-5 h-8" : f.id === "horizontal" ? "w-8 h-5" : "w-6 h-6"}`} />
              <span className="text-[10px] font-medium text-white">{f.label}</span>
              <span className="text-[8px] text-muted-foreground">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 glow-red-sm"
      >
        Suivant <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}