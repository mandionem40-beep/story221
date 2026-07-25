import { useState, useEffect } from "react";
import { Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakPreview, stopPreview } from "@/lib/voice-catalog";

/**
 * VoiceCard — displays a single voice with instant preview.
 * Clicking the play button reads the voice's personalized preview message
 * using the browser's built-in SpeechSynthesis (free, instant, offline).
 */
export default function VoiceCard({ voice, selected, onSelect }) {
  const [playing, setPlaying] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setTtsAvailable(false);
      return;
    }
    // Ensure voices are loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {}, { once: true });
    }
    return () => { if (playing) stopPreview(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreview = (e) => {
    e.stopPropagation();
    if (!ttsAvailable) return;
    if (playing) {
      stopPreview();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakPreview(voice, () => setPlaying(false));
  };

  return (
    <div
      onClick={() => onSelect?.(voice)}
      className={cn(
        "relative rounded-2xl border-2 p-4 transition-all duration-300 cursor-pointer group",
        selected
          ? "border-primary bg-primary/10 glow-red-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
      )}
    >
      {/* Top row: avatar + play */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${voice.color}22` }}
        >
          {voice.emoji}
        </div>
        <button
          onClick={handlePreview}
          disabled={!ttsAvailable}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90",
            playing
              ? "bg-primary text-white glow-red-sm"
              : "bg-secondary text-primary hover:bg-primary/20"
          )}
          title={playing ? "Arrêter" : "Écouter un extrait"}
        >
          {playing ? (
            <Square className="w-4 h-4" fill="currentColor" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Name + description */}
      <h3 className="text-sm font-bold text-white leading-tight">{voice.name}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{voice.description}</p>

      {/* Personality */}
      <p className="text-[11px] text-muted-foreground/80 mt-2 line-clamp-2 leading-snug">
        {voice.personality}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-secondary text-muted-foreground uppercase tracking-wide">
          {voice.gender === "male" ? "♂ Homme" : "♀ Femme"}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-secondary text-muted-foreground uppercase tracking-wide">
          {voice.ageCategory}
        </span>
      </div>

      {/* Playing indicator bar */}
      {playing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-primary overflow-hidden">
          <div className="h-full w-full animate-pulse" />
        </div>
      )}
    </div>
  );
}