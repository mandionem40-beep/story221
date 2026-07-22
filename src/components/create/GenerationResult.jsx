import { Button } from "@/components/ui/button";
import { Download, Share2, Clapperboard, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import ShareModal from "@/components/share/ShareModal";

export default function GenerationResult({ generation, result, onPublish, onNew }) {
  const [publishing, setPublishing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [published, setPublished] = useState(generation?.is_published);
  const isOwner = true; // This page is always viewed by the owner

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

  const handleShare = () => {
    setShowShare(true);
  };

  const canDownload = published || generation?.ad_private_use;

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

      {/* Title + status */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{result?.title || generation?.title || "Création"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {generation?.type} · {generation?.duration_minutes || 1} min · {generation?.language}
          </p>
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
        <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[120px]">
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
                  <p className="text-xs text-muted-foreground">{char.description}</p>
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
              <div key={i} className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-primary font-semibold mb-1">Scène {i + 1}</p>
                <p className="text-sm text-white">{scene}</p>
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
                <p className="text-xs text-muted-foreground mb-1">{d.scene}</p>
                <p className="text-sm text-white">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {showShare && (
        <ShareModal
          url={result?.resultUrl || `${window.location.origin}/app/reels`}
          title={result?.title || generation?.title || "Ma création Story221"}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}