import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { voiceLanguages, voiceCatalog } from "@/lib/voice-catalog";
import VoiceCard from "./VoiceCard";

/**
 * VoiceLibrary — full voice catalog with language tabs and search.
 *
 * Can be used standalone (page) or embedded in a dialog.
 * When `onSelect` is provided, cards are selectable and return the voice object.
 */
export default function VoiceLibrary({ selectedId, onSelect, showSearch = true }) {
  const [activeLang, setActiveLang] = useState("fr");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = voiceCatalog.filter((v) => v.language === activeLang);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.personality.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeLang, query]);

  return (
    <div>
      {/* Language tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {voiceLanguages.map((lang) => {
          const count = voiceCatalog.filter((v) => v.language === lang.id).length;
          return (
            <button
              key={lang.id}
              onClick={() => setActiveLang(lang.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                activeLang === lang.id
                  ? "bg-primary/10 border-primary/40 text-white"
                  : "bg-card border-border text-muted-foreground hover:text-white"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              {lang.label}
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une voix..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl bg-card border border-border text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
      )}

      {/* Voice grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            selected={selectedId === voice.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aucune voix trouvée pour « {query} »
        </div>
      )}

      {/* Note about TTS */}
      <p className="text-[11px] text-muted-foreground/60 mt-6 text-center">
        🎧 Les aperçus vocaux utilisent la synthèse vocale du navigateur (instantané, hors ligne).
        La qualité dépend de votre appareil.
      </p>
    </div>
  );
}