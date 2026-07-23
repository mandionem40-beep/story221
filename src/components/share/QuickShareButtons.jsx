import { useState } from "react";
import { MessageCircle, Facebook, Instagram, Music, Youtube, Copy, Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { name: "WhatsApp", icon: MessageCircle, color: "bg-green-500 hover:bg-green-600", url: (t, u) => `https://wa.me/?text=${encodeURIComponent(t)}%20${encodeURIComponent(u)}` },
  { name: "Facebook", icon: Facebook, color: "bg-blue-600 hover:bg-blue-700", url: (t, u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-600 to-pink-500 hover:opacity-90", copy: true, url: () => "https://www.instagram.com/" },
  { name: "TikTok", icon: Music, color: "bg-black border border-white/20 hover:bg-black/80", copy: true, url: () => "https://www.tiktok.com/upload" },
  { name: "YouTube", icon: Youtube, color: "bg-red-600 hover:bg-red-700", copy: true, url: () => "https://www.youtube.com/upload" },
];

export default function QuickShareButtons({ url, title, className }) {
  const [copied, setCopied] = useState(false);

  const open = (platformUrl, copyFirst = false) => {
    if (copyFirst) {
      navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    window.open(platformUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: title || "Story221", url }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
        <Share2 className="w-3.5 h-3.5" /> Partager
      </span>
      {PLATFORMS.map(p => (
        <button
          key={p.name}
          onClick={() => open(p.url(title, url), p.copy)}
          title={`Partager sur ${p.name}`}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 flex-shrink-0",
            p.color
          )}
        >
          <p.icon className="w-4 h-4 text-white" />
        </button>
      ))}
      <button
        onClick={handleNativeShare}
        title="Partager via une autre app"
        className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center transition-all hover:scale-110 hover:bg-secondary/70 flex-shrink-0"
      >
        <Share2 className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        title="Copier le lien"
        className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center transition-all hover:scale-110 hover:bg-secondary/70 flex-shrink-0"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white" />}
      </button>
    </div>
  );
}