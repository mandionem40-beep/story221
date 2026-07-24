import { Users, Eye, Heart, Video } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function InfluencerCard({ influencer, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors w-full"
    >
      <div className="aspect-square bg-secondary flex items-center justify-center">
        {influencer.avatar_url ? (
          <Image src={influencer.avatar_url} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {influencer.name?.charAt(0)?.toUpperCase() || "IA"}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-bold text-white truncate flex-1">{influencer.name}</span>
          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[8px]">🤖</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{influencer.bio || "Influenceur IA"}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{influencer.follower_count || 0}</span>
          <span className="flex items-center gap-0.5"><Video className="w-3 h-3" />{influencer.content_count || 0}</span>
          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{influencer.total_views || 0}</span>
        </div>
      </div>
    </button>
  );
}