import { Button } from "@/components/ui/button";
import { Download, Share2, Clapperboard, Loader2, Lock, Megaphone, Clapperboard as Film, Type, Palette, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Image } from "@/components/ui/image";
import ShareModal from "@/components/share/ShareModal";
import CreativeFeedbackWidget from "@/components/creative/CreativeFeedbackWidget";
import QuickShareButtons from "@/components/share/QuickShareButtons";

const SUBTITLE_COLORS = [
  { id: "white", label: "Blanc", value: "#ffffff" },
  { id: "yellow", label: "Jaune", value: "#ffeb3b" },
  { id: "red", label: "Rouge", value: "#ff5252" },
  { id: "green", label: "Vert", value: "#69f0ae" },
  { id: "blue", label: "Bleu", value: "#40c4ff" },
];

const SUBTITLE_FONTS = [
  { id: "sans", label: "Sans-serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { id: "serif", label: "Serif", value: "ui-serif, Georgia, serif" },
  { id: "mono", label: "Monospace", value: "ui-monospace, monospace" },
];

export default function GenerationResult({ generation, result, onPublish, onNew, onRetry }) {
  const [publishing, setPublishing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [published, setPublished] = useState(generation?.is_published);
  const [subtitles, setSubtitles] = useState(result?.subtitles || []);
  const [subtitleColor, setSubtitleColor] = useState("white");
  const [subtitleFont, setSubtitleFont] = useState("sans");

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublish();
      setPublished(true);
    } catch { /* ignore */ }
    setPublishing(false);
  };

  const handleDownload = () => {
    if (!result?.resultUrl) return;
    const a = document.createElement("a");
    a.href = result.resultUrl;
    a.download = `${generation?.title || "creation"}.${result.resultType === "video" ? "mp4" : result.resultType === "image" ? "png" : "mp3"}`;
    a.click();
  };

  const canDownload = published || generation?.ad_private_use;
  const colorValue = SUBTITLE_COLORS.find(c => c.id === subtitleColor)?.value || "#ffffff";
  const fontValue = SUBTITLE_FONTS.find(f => f.id === subtitleFont)?.value || "sans-serif";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Result preview */}
      {result?.resultUrl && result.resultType === "video" && (
        <div className="rounded-2xl overflow-hidden bg-black mb-6">
          <video src={result.resultUrl} controls className="w-full max-h-[500px]" />
        </div>
      )}
      {result?.resultUrl && result.resultType === "image" && (
        <div className="rounded-2xl overflow-hidden bg-black mb-6">
          <Image src={result.resultUrl} fittingType="fit" className="w-full max-h-[500px]" />
        </div>
      )}
      {result?.resultUrl && result.resultType === "audio" && (
        <div className="rounded-2xl bg-card border border-border p-6 mb-6">
          <audio src={result.resultUrl} controls className="w-full" />
        </div>
      )}

      {/* Quick share buttons */}
      {result?.resultUrl && (
        <div className="mb-6 p-3 rounded-xl bg-card border border-border">
          <QuickShareButtons
            url={result.resultUrl}
            title={result?.title || generation?.title || "Ma création Story221"}
          />
        </div>
      )}

      {/* Voice player (separate from video) */}
      {result?.voiceUrl && result.resultType !== "audio" && (
        <div className="rounded-xl bg-card border border-border p-4 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Voix générée</p>
          <audio src={result.voiceUrl} controls className="w-full" />
        </div>
      )}

      {/* Title + status */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{result?.title || generation?.title || "Création"}</h1>
          {result?.synopsis && (
            <p className="text-sm text-muted-foreground mt-1 italic">{result.synopsis}</p>
          )}
          {!result?.synopsis && (
            <p className="text-sm text-muted-foreground mt-1">
              {generation?.type} · {generation?.duration_minutes || 1} min · {generation?.language}
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
          canDownload ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
        }`}>
          {canDownload ? "Téléchargeable" : "Non téléchargeable"}
        </div>
      </div>

      {/* Download status notice */}
      {!canDownload && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-yellow-500/20 mb-6">
          <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Votre création n'est pas encore téléchargeable. Publiez-la dans les Reels pour la débloquer.
          </p>
        </div>
      )}

      {/* Ad info (for ads) */}
      {generation?.type === "ad" && (result?.adConcept || result?.adSlogan || result?.adCta) && (
        <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Concept Publicitaire</span>
          </div>
          {result?.adConcept && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">Concept</p>
              <p className="text-sm text-white">{result.adConcept}</p>
            </div>
          )}
          {result?.adSlogan && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">Slogan</p>
              <p className="text-sm text-white font-semibold">"{result.adSlogan}"</p>
            </div>
          )}
          {result?.adCta && (
            <div>
              <p className="text-xs text-muted-foreground">Appel à l'action</p>
              <p className="text-sm text-white">{result.adCta}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {!published && !generation?.ad_private_use && (
          <Button onClick={handlePublish} disabled={publishing} className="flex-1 min-w-[180px]">
            {publishing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publication...</> : <><Clapperboard className="w-4 h-4 mr-2" />Publier dans les Reels</>}
          </Button>
        )}
        <Button onClick={handleDownload} disabled={!canDownload || !result?.resultUrl} variant={canDownload ? "default" : "secondary"} className="flex-1 min-w-[150px]">
          <Download className="w-4 h-4 mr-2" />Télécharger
        </Button>
        <Button onClick={() => setShowShare(true)} variant="outline" className="flex-1 min-w-[120px]">
          <Share2 className="w-4 h-4 mr-2" />Partager
        </Button>
        <Button onClick={onNew} variant="outline" className="flex-1 min-w-[120px]">
          Nouvelle création
        </Button>
      </div>

      {/* Enhanced script */}
      {result?.enhancedScript && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Script</h3>
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{result.enhancedScript}</p>
          </div>
        </div>
      )}

      {/* Characters */}
      {result?.characters && result.characters.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personnages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.characters.map((char, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border flex gap-3">
                {char.image_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={char.image_url} fittingType="fill" className="w-full h-full" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{char.name}</p>
                  {char.appearance && <p className="text-xs text-muted-foreground mt-0.5">{char.appearance}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{char.description}</p>
                  {char.voice && <p className="text-xs text-primary mt-1">Voix: {char.voice}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenes */}
      {result?.scenes && result.scenes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Scènes</h3>
          <div className="space-y-2">
            {result.scenes.map((scene, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-primary font-semibold">Scène {scene.number || i + 1}</p>
                  {scene.duration_seconds && <span className="text-[10px] text-muted-foreground">{scene.duration_seconds}s</span>}
                </div>
                <p className="text-sm text-white">{typeof scene === "string" ? scene : scene.description}</p>
                {typeof scene === "object" && (scene.camera_angle || scene.lighting) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {scene.camera_angle && <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">🎥 {scene.camera_angle}</span>}
                    {scene.camera_movement && <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">↔ {scene.camera_movement}</span>}
                    {scene.lighting && <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">💡 {scene.lighting}</span>}
                    {scene.color_grade && <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">🎨 {scene.color_grade}</span>}
                    {scene.emotion && <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{scene.emotion}</span>}
                  </div>
                )}
                {typeof scene === "object" && scene.dialogue && (
                  <p className="text-xs text-muted-foreground italic mt-2">💬 {scene.dialogue}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storyboard */}
      {result?.storyboard && result.storyboard.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Film className="w-4 h-4" /> Storyboard
          </h3>
          <div className="space-y-2">
            {result.storyboard.map((shot, i) => (
              <div key={i} className="p-3 rounded-xl bg-card border border-border flex gap-3">
                <span className="text-xs text-primary font-semibold flex-shrink-0">Plan {shot.shot || i + 1}</span>
                <div>
                  <p className="text-sm text-white">{shot.description}</p>
                  {shot.visual && <p className="text-xs text-muted-foreground mt-0.5">{shot.visual}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogues */}
      {result?.dialogues && result.dialogues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dialogues</h3>
          <div className="space-y-2">
            {result.dialogues.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">{d.scene}</p>
                  {d.character && <span className="text-xs text-primary font-medium">{d.character}</span>}
                  {d.emotion && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{d.emotion}</span>}
                </div>
                <p className="text-sm text-white">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtitles with editing */}
      {subtitles && subtitles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4" /> Sous-titres
            </h3>
          </div>

          {/* Subtitle style controls */}
          <div className="flex flex-wrap gap-3 mb-3 p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Couleur:</span>
              <div className="flex gap-1">
                {SUBTITLE_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSubtitleColor(c.id)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${subtitleColor === c.id ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Police:</span>
              <div className="flex gap-1">
                {SUBTITLE_FONTS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSubtitleFont(f.id)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${subtitleFont === f.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle preview with editing */}
          <div className="space-y-2">
            {subtitles.map((sub, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-xs text-primary font-mono flex-shrink-0 mt-1">{sub.timestamp}</span>
                <input
                  value={sub.text}
                  onChange={(e) => {
                    const next = [...subtitles];
                    next[i] = { ...sub, text: e.target.value };
                    setSubtitles(next);
                  }}
                  className="flex-1 bg-transparent text-sm text-white outline-none border-b border-transparent focus:border-primary/40"
                  style={{ color: colorValue, fontFamily: fontValue }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continuity notes */}
      {result?.continuityNotes && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes de continuité</h3>
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-white">{result.continuityNotes}</p>
          </div>
        </div>
      )}

      {/* Creative memory feedback */}
      <CreativeFeedbackWidget generationId={generation?.id} />

      {showShare && (
        <ShareModal
          url={result?.resultUrl || `${window.location.origin}/app/reels`}
          title={result?.title || generation?.title || "Ma création Story221"}
          mediaUrl={result?.resultUrl}
          mediaType={result?.resultType}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}