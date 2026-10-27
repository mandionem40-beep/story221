import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Image as ImageIcon, Video as VideoIcon, ChevronDown, Upload, X, Loader2, Plus, SlidersHorizontal, Volume2, Square, Save, FolderOpen, Trash2, Clock } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { characterCategories, quickDurations, quickLanguages, quickVoices, buildChatPrompt } from "@/lib/quick-create-data";

// Cache system voices once — avoids calling getVoices() on every preview
const _voicesCache = { loaded: false, voices: [] };
function getCachedVoices() {
  if (!_voicesCache.loaded) {
    _voicesCache.voices = window.speechSynthesis?.getVoices() ?? [];
    if (_voicesCache.voices.length > 0) _voicesCache.loaded = true;
  }
  return _voicesCache.voices;
}

export default function ChatCreation({ selectedCategory, currentUser, onSelectCategory }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [refImages, setRefImages] = useState([]);
  const [refVideo, setRefVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [duration, setDuration] = useState(quickDurations[1]);
  const [language, setLanguage] = useState("Français");
  const [voice, setVoice] = useState("river");
  const [mediaType, setMediaType] = useState("video");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const uploadMenuRef = useRef(null);
  const speechRef = useRef(null);
  const draftsRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    base44.entities.Draft.filter(
      { source_type: "chat_creation", created_by_id: currentUser.id },
      "-created_date",
      10
    ).then(setDrafts).catch(() => {});
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (draftsRef.current && !draftsRef.current.contains(e.target)) {
        setShowDrafts(false);
      }
    };
    if (showDrafts) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDrafts]);

  const handleSaveDraft = async () => {
    if (!prompt.trim()) return;
    setSavingDraft(true);
    try {
      const draft = await base44.entities.Draft.create({
        title: prompt.substring(0, 60),
        source_type: "chat_creation",
        prompt: prompt.trim(),
        category_id: selectedCategory?.id || "",
        category_label: selectedCategory?.label || "",
        category_emoji: selectedCategory?.emoji || "",
        media_type: mediaType,
        duration_minutes: duration.minutes,
        language,
        voice,
        reference_images: refImages,
        reference_video: refVideo || "",
      });
      setDrafts(prev => [draft, ...prev]);
    } catch { /* ignore */ }
    setSavingDraft(false);
  };

  const loadDraft = (draft) => {
    setPrompt(draft.prompt || "");
    setMediaType(draft.media_type || "video");
    if (draft.duration_minutes) {
      const d = quickDurations.find(q => q.minutes === draft.duration_minutes);
      if (d) setDuration(d);
    }
    if (draft.language) setLanguage(draft.language);
    if (draft.voice) setVoice(draft.voice);
    setRefImages(draft.reference_images || []);
    setRefVideo(draft.reference_video || null);
    if (draft.category_id && onSelectCategory) {
      const cat = characterCategories.find(c => c.id === draft.category_id);
      if (cat) onSelectCategory(cat);
    }
    setShowDrafts(false);
  };

  const deleteDraft = async (id) => {
    try {
      await base44.entities.Draft.delete(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target)) {
        setShowUploadMenu(false);
      }
    };
    if (showUploadMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUploadMenu]);

  // Cleanup Web Speech on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        speechRef.current = null;
      }
    };
  }, []);

  const pickSystemVoice = (gender, lang) => {
    const voices = getCachedVoices();
    if (voices.length === 0) return null;

    const langPrefix = lang === "Anglais" ? "en" : "fr";
    const langVoices = voices.filter(v => v.lang?.startsWith(langPrefix));
    const pool = langVoices.length > 0 ? langVoices : voices;

    // Heuristic name patterns to distinguish male/female system voices
    const malePatterns = ["male", "daniel", "thomas", "alex", "jorge", "diego", "yannick", "lucas", "markus"];
    const femalePatterns = ["female", "amelie", "marie", "anna", "victoria", "samantha", "tessa", "zira", "clara"];

    const lower = pool.map(v => v.name.toLowerCase());
    const isMale = gender === "Homme";

    // Try exact gender match by name pattern
    const patterns = isMale ? malePatterns : femalePatterns;
    for (const p of patterns) {
      const idx = lower.findIndex(n => n.includes(p));
      if (idx !== -1) return pool[idx];
    }

    // Fallback: alternate voices by gender using index parity
    // Even indices → male, odd → female (rough but gives variety)
    const sortedPool = [...pool].sort((a, b) => a.name.localeCompare(b.name));
    const half = Math.floor(sortedPool.length / 2);
    return isMale ? sortedPool[0] || sortedPool[half] || pool[0] : sortedPool[half] || sortedPool[0] || pool[0];
  };

  const previewVoice = (voiceObj) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const samples = {
      "Français": "Bonjour, je suis votre narrateur. Voici un aperçu de ma voix pour votre création.",
      "Wolof": "Salaam aleekum, ma ngi tudd narrateur. Lii mooy biral sama baat.",
      "Anglais": "Hello, I am your narrator. Here is a preview of my voice for your creation.",
    };
    const text = samples[language] || samples["Français"];

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = voiceObj.speechConfig.rate;
    utter.pitch = voiceObj.speechConfig.pitch;
    utter.volume = 1;
    utter.lang = language === "Anglais" ? "en-US" : "fr-FR";

    // Select a distinct system voice based on gender
    const sysVoice = pickSystemVoice(voiceObj.gender, language);
    if (sysVoice) utter.voice = sysVoice;

    utter.onend = () => setPreviewingVoice(false);
    utter.onerror = () => setPreviewingVoice(false);
    speechRef.current = utter;
    setPreviewingVoice(true);
    window.speechSynthesis.speak(utter);
  };

  const stopPreview = () => {
    window.speechSynthesis.cancel();
    setPreviewingVoice(false);
  };

  const cost = mediaType === "video" ? duration.cost : 5;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        urls.push(res.file_url);
      }
      setRefImages(prev => [...prev, ...urls]);
    } catch {
      toast({ title: "Upload échoué", description: "Impossible d'envoyer l'image. Réessayez plus tard.", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setRefVideo(res.file_url);
    } catch {
      toast({ title: "Upload échoué", description: "Impossible d'envoyer la vidéo. Réessayez plus tard.", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (idx) => setRefImages(prev => prev.filter((_, i) => i !== idx));
  const removeVideo = () => setRefVideo(null);

  const handleGenerate = () => {
    if (!prompt.trim() || !selectedCategory) return;
    const fullPrompt = buildChatPrompt(selectedCategory, prompt.trim(), {
      duration, language, voice, music: "Joyeuse", format: mediaType === "video" ? "vertical" : "square",
    });
    const params = new URLSearchParams();
    params.set("type", mediaType);
    params.set("prompt", fullPrompt);
    params.set("style", selectedCategory.label);
    params.set("language", language);
    if (mediaType === "video") params.set("duration", duration.minutes);
    if (refImages.length > 0) params.set("ref_images", refImages.join(","));
    if (refVideo) params.set("ref_video", refVideo);
    navigate(`/app/create?${params.toString()}`);
  };

  return (
    <div className="rounded-3xl bg-card border border-border p-4 sm:p-5">
      {/* Selected style indicator */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {selectedCategory ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              {selectedCategory.emoji} {selectedCategory.label}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Choisis un univers ci-dessous 👇</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Drafts button */}
          {drafts.length > 0 && (
            <div className="relative" ref={draftsRef}>
              <button
                onClick={() => setShowDrafts(!showDrafts)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary border border-border text-xs font-medium text-muted-foreground hover:text-white hover:border-primary/40 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Brouillons</span>
                <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold">{drafts.length}</span>
              </button>
              {showDrafts && (
                <div className="absolute top-9 right-0 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-popover border border-border shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                  {drafts.map(d => (
                    <div key={d.id} className="flex items-center gap-2 p-2.5 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{d.title || "Sans titre"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {d.category_emoji} {d.category_label || "Sans univers"} · {d.media_type === "video" ? "Vidéo" : "Image"}
                        </p>
                      </div>
                      <button
                        onClick={() => loadDraft(d)}
                        className="px-2 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors flex-shrink-0"
                      >
                        Reprendre
                      </button>
                      <button
                        onClick={() => deleteDraft(d.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Image / Video toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary border border-border">
            <button
              onClick={() => setMediaType("image")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                mediaType === "image" ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              <ImageIcon className="w-3 h-3" /> Image
            </button>
            <button
              onClick={() => setMediaType("video")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                mediaType === "video" ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              <VideoIcon className="w-3 h-3" /> Vidéo
            </button>
          </div>
        </div>
      </div>

      {/* Prompt textarea */}
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={selectedCategory
          ? `Écris ton histoire dans l'univers ${selectedCategory.label}...`
          : "Sélectionne un univers puis écris ton histoire ici..."}
        className="w-full min-h-[100px] bg-secondary border border-border rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/40"
        autoFocus
      />

      {/* Reference media thumbnails */}
      {(refImages.length > 0 || refVideo) && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {refImages.map((url, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
          {refVideo && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary flex items-center justify-center">
              <VideoIcon className="w-5 h-5 text-muted-foreground" />
              <button onClick={removeVideo} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar: upload + settings + generate (3 zones) */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-3">
        {/* Zone 1: Upload "+" button */}
        <div className="relative flex-shrink-0" ref={uploadMenuRef}>
          <button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Plus className={`w-4 h-4 text-muted-foreground transition-transform ${showUploadMenu ? "rotate-45" : ""}`} />}
          </button>
          {showUploadMenu && (
            <div className="absolute bottom-11 left-0 z-50 w-36 rounded-xl bg-popover border border-border shadow-xl overflow-hidden">
              <button
                onClick={() => { imageInputRef.current?.click(); setShowUploadMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-white hover:bg-primary/10 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-primary" /> Photo
              </button>
              <button
                onClick={() => { videoInputRef.current?.click(); setShowUploadMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-white hover:bg-primary/10 transition-colors border-t border-border"
              >
                <VideoIcon className="w-3.5 h-3.5 text-primary" /> Vidéo
              </button>
            </div>
          )}
          <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
        </div>

        {/* Zone 2: Settings toggle (elongated) */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-9 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-white hover:border-primary/40 transition-colors flex-1 min-w-0"
        >
          <SlidersHorizontal className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${showSettings ? "text-primary" : ""}`} />
          <span className="truncate">{duration.label} · {language}</span>
        </button>

        {/* Zone 3: Generate button (50%) */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || !selectedCategory}
          className="w-1/2 h-9 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-red-sm flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{prompt.trim() && selectedCategory ? `Générer (${cost} 💎)` : "Générer"}</span>
        </button>
      </div>

      {/* Save draft link */}
      {prompt.trim() && (
        <button
          onClick={handleSaveDraft}
          disabled={savingDraft}
          className="w-full mt-2 h-7 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5 transition-colors"
        >
          {savingDraft ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          {savingDraft ? "Sauvegarde..." : "Sauvegarder en brouillon"}
        </button>
      )}

      {/* Collapsible settings */}
      {showSettings && (
        <div className="space-y-3 p-3 rounded-xl bg-secondary border border-border mt-3">
          {mediaType === "video" && (
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
          )}
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
          {mediaType === "video" && (
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
              {/* Voice presentation card — shown when a voice is selected */}
              {(() => {
                const selected = quickVoices.find(v => v.id === voice);
                if (!selected) return null;
                return (
                  <div className="mt-2 p-3 rounded-xl bg-card border border-primary/30">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{selected.label}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-[10px] font-semibold text-primary">
                            {selected.gender}
                          </span>
                          <span className="text-[10px] text-muted-foreground">— {selected.desc}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-medium text-muted-foreground">
                            Ton: {selected.tone}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-medium text-muted-foreground">
                            Rythme: {selected.rhythm}
                          </span>
                        </div>
                      </div>
                      {"speechSynthesis" in window && (
                        <button
                          onClick={() => previewingVoice ? stopPreview() : previewVoice(selected)}
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                            previewingVoice
                              ? "bg-destructive/10 border-destructive/40 text-destructive"
                              : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {previewingVoice ? <Square className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          {previewingVoice ? "Stop" : "Écouter"}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}