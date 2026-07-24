import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { characterCategories, colors, visualStyles, personalityTraits, quickVoices, quickLanguages } from "@/lib/quick-create-data";
import { contentThemes } from "@/lib/influencer-data";
import { X, ChevronLeft, ChevronRight, Loader2, RefreshCw, Volume2, Lock } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function InfluencerCreate({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [source, setSource] = useState(null); // "existing" | "new"
  const [selectedChar, setSelectedChar] = useState(null);
  const [character, setCharacter] = useState({ category: null, appearance: null, color: null, visualStyle: null, traits: [], name: "" });
  const [bio, setBio] = useState("");
  const [themes, setThemes] = useState([]);
  const [personalityProfile, setPersonalityProfile] = useState("");
  const [speechSamples, setSpeechSamples] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [voice, setVoice] = useState("river");
  const [language, setLanguage] = useState("Français");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    base44.entities.Character.filter({}, "-created_date", 50)
      .then(setSavedCharacters).catch(() => {});
  }, []);

  const pickExisting = (char) => {
    setSelectedChar(char);
    setCharacter({
      name: char.name,
      category: char.category,
      appearance: { emoji: "🎭", label: char.appearance },
      color: { label: char.color },
      visualStyle: { label: char.visual_style },
      traits: char.personality_traits || [],
    });
    setStep(2);
  };

  const buildNew = () => {
    setSource("new");
    setSelectedChar(null);
  };

  const generatePersonality = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en création de personnages IA. Génère une fiche de personnalité (2-3 phrases) pour un personnage nommé ${character.name}, un(e) ${character.appearance?.label} de couleur ${character.color?.label} en style ${character.visualStyle?.label}. Traits: ${character.traits.join(", ")}. Thématiques de contenu: ${themes.join(", ")}. Bio: ${bio}. Génère aussi 3 exemples de phrases que ce personnage dirait typiquement (max 15 mots chacune). Réponds en JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            profile: { type: "string" },
            speech_samples: { type: "array", items: { type: "string" } },
          },
        },
      });
      setPersonalityProfile(result.profile || "");
      setSpeechSamples(result.speech_samples || []);
    } catch {
      toast({ title: "Erreur", description: "Génération impossible.", variant: "destructive" });
    }
    setGenerating(false);
  };

  const previewVoice = () => {
    const lang = quickLanguages.find(l => l.id === language);
    try {
      const u = new SpeechSynthesisUtterance(lang?.sample || "Bonjour");
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const inf = await base44.entities.Influencer.create({
        name: character.name,
        bio,
        avatar_url: selectedChar?.image_url || selectedChar?.reference_image_url || "",
        character_id: selectedChar?.id || null,
        category: character.category,
        appearance: character.appearance?.label,
        color: character.color?.label,
        visual_style: character.visualStyle?.label,
        personality_traits: character.traits,
        personality_profile: personalityProfile,
        speech_samples: speechSamples,
        frozen_voice: voice,
        frozen_language: language,
        content_themes: themes,
        follower_count: 0,
        total_likes: 0,
        total_views: 0,
        content_count: 0,
      });
      toast({ title: "Influenceur créé !", description: `${inf.name} est prêt à publier.` });
      onCreated(inf);
    } catch {
      toast({ title: "Erreur", description: "Création impossible.", variant: "destructive" });
    }
    setCreating(false);
  };

  const canNext = () => {
    if (step === 1) return source === "existing" ? !!selectedChar : (!!character.category && !!character.appearance && !!character.color && !!character.visualStyle);
    if (step === 2) return character.name.trim() && themes.length > 0;
    if (step === 3) return personalityProfile && speechSamples.length > 0;
    if (step === 4) return !!voice;
    return true;
  };

  const toggleTheme = (t) => {
    setThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Créer un Influenceur IA</h2>
          <button onClick={() => onClose()} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {/* Step 1: Source & Character */}
        {step === 1 && (
          <div>
            {!source && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSource("existing")} className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/30 text-center">
                  <span className="text-3xl block mb-1">📚</span>
                  <span className="text-sm font-medium text-white">Promouvoir un personnage</span>
                </button>
                <button onClick={buildNew} className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/30 text-center">
                  <span className="text-3xl block mb-1">✨</span>
                  <span className="text-sm font-medium text-white">Créer un nouveau</span>
                </button>
              </div>
            )}

            {source === "existing" && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Choisis un personnage existant</p>
                {savedCharacters.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun personnage sauvegardé. Créez-en un via la Création Rapide d'abord.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {savedCharacters.map(c => (
                      <button key={c.id} onClick={() => pickExisting(c)} className="flex items-center gap-2 p-2 rounded-xl bg-secondary border border-border hover:border-primary/30 text-left">
                        {c.image_url ? <Image src={c.image_url} fittingType="fill" className="w-8 h-8 rounded-lg flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-primary/20 flex-shrink-0" />}
                        <span className="text-sm text-white truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setSource(null)} className="mt-3 text-xs text-muted-foreground hover:text-white">← Retour</button>
              </div>
            )}

            {source === "new" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Catégorie</label>
                  <div className="grid grid-cols-4 gap-2">
                    {characterCategories.map(cat => (
                      <button key={cat.id} onClick={() => setCharacter({ ...character, category: cat.id, appearance: null })}
                        className={`p-2 rounded-lg border text-center ${character.category === cat.id ? "bg-primary/10 border-primary/40" : "bg-secondary border-border"}`}>
                        <span className="text-xl block">{cat.emoji}</span>
                        <span className="text-[8px] text-white">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {character.category && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Apparence</label>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                      {characterCategories.find(c => c.id === character.category)?.appearances.map(a => (
                        <button key={a.label} onClick={() => setCharacter({ ...character, appearance: a })}
                          className={`flex-shrink-0 flex flex-col items-center w-16 p-2 rounded-lg border ${character.appearance?.label === a.label ? "bg-primary/10 border-primary/40" : "bg-secondary border-border"}`}>
                          <span className="text-2xl">{a.emoji}</span>
                          <span className="text-[8px] text-white">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button key={c.id} onClick={() => setCharacter({ ...character, color: c })}
                        className={`w-8 h-8 rounded-full border-2 ${character.color?.id === c.id ? "border-primary scale-110" : "border-border"}`}
                        style={{ backgroundColor: c.hex }} title={c.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {visualStyles.map(s => (
                      <button key={s.id} onClick={() => setCharacter({ ...character, visualStyle: s })}
                        className={`p-2 rounded-lg border text-left ${character.visualStyle?.id === s.id ? "bg-primary/10 border-primary/40" : "bg-secondary border-border"}`}>
                        <span className="text-[10px] font-medium text-white block">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Traits</label>
                  <div className="flex flex-wrap gap-1.5">
                    {personalityTraits.map(t => (
                      <button key={t} onClick={() => setCharacter(prev => ({ ...prev, traits: prev.traits.includes(t) ? prev.traits.filter(x => x !== t) : [...prev.traits, t] }))}
                        className={`px-2.5 py-1 rounded-full text-xs border ${character.traits.includes(t) ? "bg-primary text-white border-primary" : "bg-secondary border-border text-muted-foreground"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Nom</label>
                  <input value={character.name} onChange={e => setCharacter({ ...character, name: e.target.value })} placeholder="Ex: Awa" maxLength={30}
                    className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Identity */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Nom de l'influenceur</label>
              <input value={character.name} onChange={e => setCharacter({ ...character, name: e.target.value })} maxLength={30}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Bio publique</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Ex: Créatrice de contenu passionnée..." rows={3}
                className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-white resize-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Thématiques de contenu</label>
              <div className="flex flex-wrap gap-1.5">
                {contentThemes.map(t => (
                  <button key={t} onClick={() => toggleTheme(t)}
                    className={`px-3 py-1.5 rounded-full text-xs border ${themes.includes(t) ? "bg-primary text-white border-primary" : "bg-secondary border-border text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Personality (Claude) */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Claude génère la fiche de personnalité à partir de vos choix :</p>
            {!personalityProfile && !generating && (
              <button onClick={generatePersonality} className="w-full py-3 rounded-xl bg-primary text-white font-semibold">Générer la personnalité</button>
            )}
            {generating && (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            )}
            {personalityProfile && (
              <>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground mb-1">Fiche de personnalité</p>
                  <p className="text-sm text-white">{personalityProfile}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phrases types</p>
                  <div className="space-y-1.5">
                    {speechSamples.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                        <span className="text-sm text-white flex-1">"{s}"</span>
                        <button onClick={previewVoice} className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Volume2 className="w-3.5 h-3.5 text-primary" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={generatePersonality} className="flex items-center gap-1.5 text-xs text-primary">
                  <RefreshCw className="w-3 h-3" /> Régénérer
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 4: Voice */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-xs text-yellow-400">La voix sera <b>figée définitivement</b> pour cet influenceur. Elle ne pourra plus être changée.</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Langue</label>
              <div className="flex gap-2">
                {quickLanguages.map(l => (
                  <button key={l.id} onClick={() => setLanguage(l.id)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm ${language === l.id ? "bg-primary/10 border-primary/40 text-white" : "bg-secondary border-border text-muted-foreground"}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Voix (figée)</label>
              <div className="grid grid-cols-1 gap-2">
                {quickVoices.map(v => (
                  <div key={v.id} className={`flex items-center justify-between p-2.5 rounded-xl border ${voice === v.id ? "bg-primary/10 border-primary/40" : "bg-secondary border-border"}`}>
                    <button onClick={() => setVoice(v.id)} className="flex-1 text-left">
                      <span className="text-sm font-medium text-white">{v.label}</span>
                      <span className="text-[10px] text-muted-foreground block">{v.desc}</span>
                    </button>
                    <button onClick={previewVoice} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Volume2 className="w-3.5 h-3.5 text-primary" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40">
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={creating || !canNext()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Créer l'influenceur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}