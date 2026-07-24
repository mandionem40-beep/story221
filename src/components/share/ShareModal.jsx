import { useState } from "react";
import { X, Copy, Check, MessageCircle, Facebook, Instagram, Music, Share2, Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

export default function ShareModal({ url, title, mediaUrl, mediaType, onClose, onShared }) {
  const [copied, setCopied] = useState(false);
  const [igPublishing, setIgPublishing] = useState(false);
  const [igPublished, setIgPublished] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "Regardez ma création sur Story221 !");

  const canAutoPublishIg = !!mediaUrl && (mediaType === "image" || mediaType === "video");

  const handleCopy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShared?.();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "Story221", url });
        onShared?.();
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const openPlatform = (platformUrl, copyFirst = false) => {
    if (copyFirst) {
      navigator.clipboard?.writeText(url);
      toast({ title: "Lien copié !", description: "Collez-le dans l'application." });
    }
    window.open(platformUrl, "_blank");
    onShared?.();
  };

  const handleInstagramPublish = async () => {
    setIgPublishing(true);
    try {
      const response = await base44.functions.invoke("instagram-publish", {
        mediaUrl,
        caption: `${title || "Ma création Story221"}\n\n#story221 #ia #creation`,
        mediaType,
      });
      if (response.data?.success) {
        setIgPublished(true);
        toast({ title: "Publié sur Instagram !", description: "Votre création est en ligne sur le compte officiel Story221." });
      } else {
        throw new Error(response.data?.error || "Échec");
      }
    } catch (err) {
      toast({ title: "Erreur Instagram", description: "Impossible de publier sur Instagram.", variant: "destructive" });
    }
    setIgPublishing(false);
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => openPlatform(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => openPlatform(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      name: "TikTok",
      icon: Music,
      color: "bg-black border border-white/20 hover:bg-black/80",
      onClick: () => openPlatform("https://www.tiktok.com/upload", true),
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-600 to-pink-500 hover:opacity-90",
      onClick: () => openPlatform("https://www.instagram.com/", true),
    },
  ];

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-sm p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Partager</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-5 truncate bg-secondary px-3 py-2 rounded-lg">{url}</p>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {platforms.map((p) => (
            <button key={p.name} onClick={p.onClick} className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center transition-all group:scale-105`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Auto-publication Instagram sur le compte officiel Story221 */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Publication auto Instagram</p>
              <p className="text-xs text-muted-foreground">
                {canAutoPublishIg
                  ? "Publier sur le compte officiel Story221"
                  : "Disponible pour les vidéos et images uniquement"}
              </p>
            </div>
            {igPublished && <Check className="w-5 h-5 text-green-500 flex-shrink-0" />}
          </div>
          <button
            onClick={handleInstagramPublish}
            disabled={!canAutoPublishIg || igPublishing || igPublished}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {igPublishing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Publication en cours...</>
            ) : igPublished ? (
              <><Check className="w-4 h-4" />Publié !</>
            ) : (
              <><Send className="w-4 h-4" />Publier sur Story221</>
            )}
          </button>
        </div>

        <div className="space-y-2">
          {hasNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full h-11 rounded-xl bg-secondary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/70"
            >
              <Share2 className="w-4 h-4" />
              Partager via une autre app
            </button>
          )}
          <button
            onClick={handleCopy}
            className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />Copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />Copier le lien
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}