import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, Send, ChevronDown, Sparkles } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { quickDurations, quickLanguages, quickVoices, quickFormats, buildChatPrompt } from "@/lib/quick-create-data";

export default function ChatPersonalize({ category, currentUser, onClose }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState("");
  const [savedChars, setSavedChars] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [duration, setDuration] = useState(quickDurations[1]);
  const [language, setLanguage] = useState("Français");
  const [voice, setVoice] = useState("river");
  const [format, setFormat] = useState("vertical");

  useEffect(() => {
    if (currentUser?.id && category?.id) {
      base44.entities.Character.filter({
        created_by_id: currentUser.id,
        category: category.id
      }, "-created_date", 10)
        .then(setSavedChars).catch(() => {});
    }
  }, [currentUser, category]);

  const cost = duration.cost;

  const handleGenerate = () => {
    if (!detail.trim()) return;
    const prompt = buildChatPrompt(category, detail.trim(), {
      duration, language, voice, music: "Joyeuse", format,
    });
    const params = new URLSearchParams();
    params.set("type", "video");
    params.set("prompt", prompt);
    params.set("style", category.label);
    params.set("language", language);
    params.set("duration", duration.minutes);
    if (selectedChar) {
      sessionStorage.setItem("pending_character_id", selectedChar.id);
    }
    onClose();
    navigate(`/app/create?${params.toString()}`);
  };

  const handleReuseChar = (char) => {
    const isSelected = selectedChar?.id === char.id;
    setSelectedChar(isSelected ? null : char);
    if (!isSelected) {
      const base = char.appearance ? `Un(e) ${char.appearance}` : "Un personnage";
      const name = char.name ? ` nommé(e) ${char.name}` : "";
      const traits = char.personality_traits?.length ? ` (${char.personality_traits.join(", ")})` : "";
      setDetail(`${base}${name}${traits}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-t-3xl sm:rounded-3xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 overflow-hidden rounded-t-3xl">
          {category.video_url ? (
            <video src={category.video_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img src={category.image} alt={category.label} className="absolute inset-0 w-full h-full object-cover animate-ken-burns" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center z-10">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-3 left-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {category.emoji} {category.label}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Body template info */}
          <div className="p-3 rounded-xl bg-secondary border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              {category.body_template}
            </p>
          </div>

          {/* Saved characters */}
          {savedChars.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Mes personnages ({savedChars.length})
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {savedChars.map(char => (
                  <button
                    key={char.id}
                    onClick={() => handleReuseChar(char)}
                    className={`flex-shrink-0 w-16 text-center p-1 rounded-xl border transition-all ${
                      selectedChar?.id === char.id ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary mx-auto overflow-hidden mb-1">
                      {char.image_url ? (
                        <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <span className="text-[10px] text-white truncate block">{char.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat input */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              {selectedChar ? "Modifier les détails" : "Qu'est-ce qui rend ton histoire unique ?"}
            </label>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder={category.id === "fruit" ? "Une mangue avec des lunettes de soleil et une veste en jean, elle rencontre une noix de coco au marché..." : category.id === "chocolate" ? "Un chocolat noir avec une couronne royale, il débat avec un pot de miel..." : "Décris ce qui rend ton personnage et ton histoire unique..."}
              className="w-full min-h-[100px] bg-secondary border border-border rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40"
              autoFocus
            />
          </div>

          {/* Quick settings */}
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettings ? "rotate-180" : ""}`} />
            Réglages ({duration.label}, {language}, {format})
          </button>

          {showSettings && (
            <div className="space-y-3 p-3 rounded-xl bg-secondary border border-border">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Durée</label>
                <div className="flex gap-1.5 flex-wrap">
                  {quickDurations.map(d => (
                    <button key={d.id} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      duration.id === d.id ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:text-white"
                    }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Langue</label>
                <div className="flex gap-1.5">
                  {quickLanguages.map(l => (
                    <button key={l.id} onClick={() => setLanguage(l.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      language === l.id ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:text-white"
                    }`}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Voix</label>
                <div className="flex gap-1.5 flex-wrap">
                  {quickVoices.map(v => (
                    <button key={v.id} onClick={() => setVoice(v.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      voice === v.id ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:text-white"
                    }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Format</label>
                <div className="flex gap-1.5">
                  {quickFormats.map(f => (
                    <button key={f.id} onClick={() => setFormat(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      format === f.id ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:text-white"
                    }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cost display */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
            <div className="flex items-center gap-2">
              <DiamondIcon className="w-4 h-4" />
              <span className="text-sm font-semibold text-white">{cost} 💎</span>
            </div>
            <span className="text-xs text-muted-foreground">{duration.minutes} min</span>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!detail.trim()}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-red-sm"
          >
            <Send className="w-4 h-4" />
            {detail.trim() ? `Générer (${cost} 💎)` : "Décris ton histoire..."}
          </button>
        </div>
      </div>
    </div>
  );
}