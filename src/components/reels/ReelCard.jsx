import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Share2, Bookmark, UserPlus, UserCheck, Download, Flag, X, Send } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import ShareModal from "@/components/share/ShareModal";
import QuickShareButtons from "@/components/share/QuickShareButtons";

export default function ReelCard({ reel, currentUser, isActive }) {
  const videoRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [reporting, setReporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const isOwner = reel.created_by_id === currentUser?.id;

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
      setCommentCount(commentsRes.length);
      setComments(commentsRes.slice(-20).reverse());
    } catch { /* ignore */ }
  }, [reel.id, reel.created_by_id, currentUser?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-play
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && reel.video_url) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive, reel.video_url]);

  // Increment views on first active
  useEffect(() => {
    if (isActive && !reel._viewed) {
      reel._viewed = true;
      base44.entities.Reel.update(reel.id, { views: (reel.views || 0) + 1 }).catch(() => {});
    }
  }, [isActive, reel]);

  const toggleLike = async () => {
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
      }
    } catch { /* ignore */ }
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
      }
    } catch { /* ignore */ }
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
      }
    } catch { /* ignore */ }
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleDownload = () => {
    if (!isOwner || !reel.video_url) return;
    const a = document.createElement("a");
    a.href = reel.video_url;
    a.download = `${reel.title || "reel"}.mp4`;
    a.click();
  };

  const handleReport = async () => {
    setReporting(false);
    setShowMenu(false);
    try {
      await base44.entities.Report.create({ reel_id: reel.id, reason: "Contenu inapproprié" });
      toast({ title: "Signalé", description: "Merci. Nous allons examiner ce contenu." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de signaler.", variant: "destructive" });
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const c = await base44.entities.Comment.create({ reel_id: reel.id, content: newComment.trim() });
      setComments([c, ...comments]);
      setCommentCount(c => c + 1);
      setNewComment("");
    } catch { /* ignore */ }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black snap-start">
      {/* Video / Image */}
      {reel.video_url ? (
        <video
          ref={videoRef}
          src={reel.video_url}
          loop
 muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : reel.thumbnail_url ? (
        <Image src={reel.thumbnail_url} fittingType="fill" className="h-full w-full" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Contenu non disponible</p>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-20 sm:bottom-24 flex flex-col gap-5 items-center z-10">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
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
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-white" />
          </div>
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
            <button
              onClick={toggleFollow}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                isFollowing ? "bg-secondary text-white" : "bg-primary text-white"
              )}
            >
              {isFollowing ? <><UserCheck className="w-3.5 h-3.5" />Suivi</> : <><UserPlus className="w-3.5 h-3.5" />Suivre</>}
            </button>
          )}
        </div>
        <p className="text-sm text-white line-clamp-2">{reel.title}</p>
        <p className="text-xs text-white/50 mt-0.5">{reel.views || 0} vues</p>
        <QuickShareButtons
          url={`${window.location.origin}/app/reels`}
          title={reel.title || "Reel Story221"}
          className="mt-3"
        />
      </div>

      {/* Report menu */}
      {showMenu && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60" onClick={() => setShowMenu(false)}>
          <div className="bg-card rounded-2xl border border-border p-4 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white mb-3">Signaler cette vidéo</p>
            <div className="space-y-2">
              <button onClick={handleReport} className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm text-white">Contenu inapproprié</button>
              <button onClick={() => { setReporting(false); setShowMenu(false); }} className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm text-white">Spam ou tromperie</button>
              <button onClick={() => setShowMenu(false)} className="w-full text-left p-3 rounded-lg hover:bg-secondary text-sm text-muted-foreground">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute inset-0 z-20 flex items-end" onClick={() => setShowComments(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full bg-card rounded-t-2xl border-t border-border max-h-[60%] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="text-sm font-semibold text-white">{commentCount} commentaire{commentCount > 1 ? "s" : ""}</p>
              <button onClick={() => setShowComments(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Soyez le premier à commenter !</p>}
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                    U
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilisateur</p>
                    <p className="text-sm text-white">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitComment()}
                placeholder="Ajouter un commentaire..."
                className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-sm text-white"
                maxLength={500}
              />
              <button onClick={submitComment} className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
      {showShare && (
        <ShareModal
          url={`${window.location.origin}/app/reels`}
          title={reel.title || "Reel Story221"}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}