import { useState, useEffect, useRef, useCallback } from "react";

import { base44 } from "@/api/base44Client";
import { createNotification } from "@/lib/notifications";
import { trackInteraction, updateTrendingScore } from "@/lib/reels-feed";
import { Heart, MessageCircle, Share2, Bookmark, UserPlus, UserCheck, Download, Flag, X, Send } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import ShareModal from "@/components/share/ShareModal";
import CommentThread from "@/components/reels/CommentThread";

export default function ReelCard({ reel, currentUser, isActive, isNext, onEnded }) {
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const viewedRef = useRef(false);

  const isOwner = reel.created_by_id === currentUser?.id;
  const shareUrl = `${window.location.origin}/reel?id=${reel.id}`;

  // Connection-aware preload
  const conn = typeof navigator !== "undefined" && (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
  const isSlow = conn && (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
  const preloadAttr = isNext && !isSlow ? "auto" : isSlow ? "none" : "metadata";

  const loadData = useCallback(async () => {
    try {
      const [likes, favs, follows, commentsRes] = await Promise.all([
        base44.entities.Like.filter({ reel_id: reel.id }),
        base44.entities.Favorite.filter({ reel_id: reel.id, created_by_id: currentUser?.id }),
        base44.entities.Follow.filter({ followed_id: reel.created_by_id, created_by_id: currentUser?.id }),
        base44.entities.Comment.filter({ reel_id: reel.id }),
      ]);
      setLikeCount(likes.length);
      setIsLiked(likes.some(l => l.created_by_id === currentUser?.id));
      setIsFavorited(favs.length > 0);
      setIsFollowing(follows.length > 0);
      setCommentCount(commentsRes.filter(c => !c.hidden).length);
      setShareCount(reel.share_count || 0);
    } catch {}
  }, [reel.id, reel.created_by_id, reel.share_count, currentUser?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && reel.video_url) {
      v.play().catch(() => {});
    } else {
      v.pause();
      setVideoReady(false);
    }
  }, [isActive, reel.video_url]);

  useEffect(() => {
    if (isActive && !viewedRef.current) {
      viewedRef.current = true;
      base44.entities.Reel.update(reel.id, { views: (reel.views || 0) + 1 }).catch(() => {});
      trackInteraction(reel.id, "view", reel.created_by_id);
      updateTrendingScore(reel.id);
    }
  }, [isActive, reel.id, reel.created_by_id, reel.views]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const myLike = await base44.entities.Like.filter({ reel_id: reel.id, created_by_id: currentUser.id });
        if (myLike[0]) await base44.entities.Like.delete(myLike[0].id);
        setIsLiked(false);
        setLikeCount(c => c - 1);
      } else {
        await base44.entities.Like.create({ reel_id: reel.id });
        setIsLiked(true);
        setLikeCount(c => c + 1);
        trackInteraction(reel.id, "like", reel.created_by_id);
        updateTrendingScore(reel.id);
        if (reel.created_by_id && reel.created_by_id !== currentUser.id) {
          createNotification({
            recipientId: reel.created_by_id, type: "like",
            title: "Nouveau like",
            body: `${currentUser?.username || "Quelqu'un"} a aimé votre vidéo`,
            sourceUserId: currentUser.id, reelId: reel.id,
          });
        }
      }
    } catch {}
  };

  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        const myFav = await base44.entities.Favorite.filter({ reel_id: reel.id, created_by_id: currentUser.id });
        if (myFav[0]) await base44.entities.Favorite.delete(myFav[0].id);
        setIsFavorited(false);
      } else {
        await base44.entities.Favorite.create({ reel_id: reel.id });
        setIsFavorited(true);
        trackInteraction(reel.id, "favorite", reel.created_by_id);
      }
    } catch {}
  };

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        const myFollow = await base44.entities.Follow.filter({ followed_id: reel.created_by_id, created_by_id: currentUser.id });
        if (myFollow[0]) await base44.entities.Follow.delete(myFollow[0].id);
        setIsFollowing(false);
      } else {
        await base44.entities.Follow.create({ followed_id: reel.created_by_id });
        setIsFollowing(true);
        if (reel.created_by_id !== currentUser.id) {
          createNotification({
            recipientId: reel.created_by_id, type: "follow",
            title: "Nouvel abonné",
            body: `${currentUser?.username || "Quelqu'un"} vous suit maintenant`,
            sourceUserId: currentUser.id,
          });
        }
      }
    } catch {}
  };

  const handleShared = async () => {
    setShareCount(c => c + 1);
    try {
      await base44.entities.Reel.update(reel.id, { share_count: (reel.share_count || 0) + 1 });
      trackInteraction(reel.id, "share", reel.created_by_id);
      updateTrendingScore(reel.id);
    } catch {}
  };

  const handleDownload = () => {
    if (!isOwner || !reel.video_url) return;
    const a = document.createElement("a");
    a.href = reel.video_url;
    a.download = `${reel.title || "reel"}.mp4`;
    a.click();
  };

  const handleReport = async () => {
    setShowMenu(false);
    try {
      await base44.entities.Report.create({ reel_id: reel.id, reason: "Contenu inapproprié" });
      toast({ title: "Signalé", description: "Merci. Nous allons examiner ce contenu." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de signaler.", variant: "destructive" });
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black snap-start">
      {/* Video / Image with double-tap */}
      <div className="relative h-full w-full bg-card" onClick={handleVideoTap}>
        {/* Thumbnail always visible as background layer — no black screen */}
        {reel.thumbnail_url && (
          <img
            src={reel.thumbnail_url}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              videoReady && reel.video_url ? "opacity-0" : "opacity-100"
            )}
          />
        )}
        {reel.video_url ? (
          <video
            ref={videoRef}
            src={reel.video_url}
            muted
            playsInline
            preload={preloadAttr}
            poster={reel.thumbnail_url || undefined}
            onPlaying={() => setVideoReady(true)}
            onEnded={onEnded}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
              videoReady ? "opacity-100" : "opacity-0"
            )}
            style={{ willChange: "opacity", transform: "translateZ(0)" }}
          />
        ) : reel.thumbnail_url ? null : (
          <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Contenu non disponible</p></div>
        )}
      </div>

      {/* Double-tap heart animation */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart className="w-20 h-20 text-white fill-white drop-shadow-2xl animate-pulse" />
        </div>
      )}

      {/* AI transparency label — required by Veo 3 SynthID policy */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 pointer-events-none">
        <span className="text-[9px] font-medium text-white/80">Contenu généré par IA</span>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-20 sm:bottom-24 flex flex-col gap-5 items-center z-10">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm", isLiked ? "bg-primary" : "bg-black/40")}>
            <Heart className={cn("w-5 h-5 text-white", isLiked && "fill-white")} />
          </div>
          <span className="text-xs text-white font-medium">{likeCount}</span>
        </button>
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-white font-medium">{commentCount}</span>
        </button>
        <button onClick={() => setShowShare(true)} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-white font-medium">{shareCount}</span>
        </button>
        <button onClick={toggleFavorite} className="flex flex-col items-center gap-1">
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm", isFavorited ? "bg-primary" : "bg-black/40")}>
            <Bookmark className={cn("w-5 h-5 text-white", isFavorited && "fill-white")} />
          </div>
        </button>
        {isOwner ? (
          <button onClick={handleDownload} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center glow-red-sm">
              <Download className="w-5 h-5 text-white" />
            </div>
          </button>
        ) : (
          <button onClick={() => setShowMenu(true)} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <Flag className="w-5 h-5 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Author info */}
      <div className="absolute left-4 right-20 bottom-20 sm:bottom-24 z-10">
        <div className="flex items-center gap-2 mb-2">
          {reel.author_avatar ? (
            <img src={reel.author_avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold border-2 border-primary">
              {(reel.author_name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">@{reel.author_name || "createur"}</p>
          </div>
          {!isOwner && (
            <button onClick={toggleFollow} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1", isFollowing ? "bg-secondary text-white" : "bg-primary text-white")}>
              {isFollowing ? <><UserCheck className="w-3.5 h-3.5" />Suivi</> : <><UserPlus className="w-3.5 h-3.5" />Suivre</>}
            </button>
          )}
        </div>
        <p className="text-sm text-white line-clamp-2">{reel.title}</p>
        <p className="text-xs text-white/50 mt-0.5">{reel.views || 0} vues · {shareCount} partages</p>
      </div>

      {/* Report menu */}
      {showMenu && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60" onClick={() => setShowMenu(false)}>
          <div className="bg-card rounded-2xl border border-border p-4 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white mb-3">Signaler cette vidéo</p>
            <div className="space-y-2">
              <button onClick={handleReport} className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm text-white">Contenu inapproprié</button>
              <button onClick={() => setShowMenu(false)} className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm text-white">Spam ou tromperie</button>
              <button onClick={() => setShowMenu(false)} className="w-full text-left p-3 rounded-lg hover:bg-secondary text-sm text-muted-foreground">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute inset-0 z-30 flex items-end" onClick={() => setShowComments(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full" onClick={e => e.stopPropagation()}>
            <CommentThread
              reelId={reel.id}
              reelOwnerId={reel.created_by_id}
              currentUser={currentUser}
              commentCount={commentCount}
              onCountChange={(n) => { setCommentCount(n); if (n === commentCount) setShowComments(false); }}
            />
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShare && (
        <ShareModal url={shareUrl} title={reel.title || "Reel Story221"} mediaUrl={reel.video_url} mediaType="video" onShared={handleShared} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}