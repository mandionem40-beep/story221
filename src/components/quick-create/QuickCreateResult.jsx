import { useState } from "react";
import { RotateCcw, Bookmark, BookmarkCheck, Film, Share2, Layers } from "lucide-react";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";

export default function QuickCreateResult({ generation, result, character, onPublish, onNew, onSaveCharacter, onEpisode2 }) {
  const [published, setPublished] = useState(generation?.is_published);
  const [characterSaved, setCharacterSaved] = useState(false);

  const handlePublish = async () => {
    await onPublish();
    setPublished(true);
  };

  const handleSaveCharacter = async () => {
    await onSaveCharacter();
    setCharacterSaved(true);
  };

  const videoUrl = result?.videoUrl || result?.resultUrl || generation?.result_url;
  const resultType = result?.resultType || generation?.result_type || "video";

  return (
    <div className="flex flex-col items-center">
      {/* Video player */}
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-black border border-border mb-5">
        {resultType === "video" ? (
          <video src={videoUrl} controls autoPlay loop className="w-full max-h-[450px] object-contain" />
        ) : resultType === "audio" ? (
          <div className="p-6"><audio src={videoUrl} controls autoPlay className="w-full" /></div>
        ) : (
          <Image src={videoUrl} fittingType="fit" className="w-full max-h-[450px]" />
        )}
      </div>

      <h2 className="text-lg font-bold text-white mb-1 text-center">{result?.title || generation?.title || "Création"}</h2>
      <p className="text-xs text-muted-foreground mb-6 text-center">
        {character.name} · {character.appearance?.label}
      </p>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-2">
        {!published ? (
          <button
            onClick={handlePublish}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 glow-red-sm"
          >
            <Film className="w-4 h-4" /> Publier dans les Reels
          </button>
        ) : (
          <div className="w-full h-12 rounded-2xl bg-green-500/20 text-green-400 font-semibold flex items-center justify-center gap-2">
            <Film className="w-4 h-4" /> Publié dans les Reels !
          </div>
        )}

        <button
          onClick={handleSaveCharacter}
          disabled={characterSaved}
          className="w-full h-11 rounded-2xl bg-card border border-border text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {characterSaved ? <BookmarkCheck className="w-4 h-4 text-green-400" /> : <Bookmark className="w-4 h-4" />}
          {characterSaved ? "Personnage sauvegardé" : "Sauvegarder le personnage"}
        </button>

        <button
          onClick={onEpisode2}
          className="w-full h-11 rounded-2xl bg-card border border-border text-white font-medium flex items-center justify-center gap-2"
        >
          <Layers className="w-4 h-4" /> Créer un Épisode 2
        </button>

        <button
          onClick={onNew}
          className="w-full h-11 rounded-2xl bg-secondary text-muted-foreground font-medium flex items-center justify-center gap-2 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" /> Recommencer
        </button>
      </div>
    </div>
  );
}