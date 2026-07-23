import { useState } from "react";
import { X, Copy, Check, MessageCircle, Facebook, Music, Instagram, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ReferralShareModal({ referralLink, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareText = "Rejoins-moi sur Story221, le studio IA social d'Afrique ! Crée des vidéos IA à partir d'un simple prompt et reçois ton premier essai gratuit 👇";
  const encodedUrl = encodeURIComponent(referralLink);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Lien copié !", description: "Partagez-le avec vos amis." });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Story221", text: shareText, url: referralLink });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  const openPlatform = (platformUrl, copyFirst = false) => {
    if (copyFirst) {
      navigator.clipboard?.writeText(referralLink);
      toast({ title: "Lien copié !", description: "Collez-le dans l'application." });
    }
    window.open(platformUrl, "_blank");
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank"),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank"),
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
          <h3 className="text-lg font-semibold text-white">Inviter des amis</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Partagez votre lien de parrainage. Gagnez <span className="text-primary font-semibold">5 💎</span> pour chaque ami qui publie son premier projet.
        </p>

        <p className="text-xs text-muted-foreground mb-5 truncate bg-secondary px-3 py-2 rounded-lg">{referralLink}</p>

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
              <><Check className="w-4 h-4" />Copié !</>
            ) : (
              <><Copy className="w-4 h-4" />Copier le lien</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}