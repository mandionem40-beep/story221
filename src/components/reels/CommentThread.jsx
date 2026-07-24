import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { createNotification } from "@/lib/notifications";
import { trackInteraction, updateTrendingScore } from "@/lib/reels-feed";
import { X, Send, Pin, EyeOff, Eye, Trash2, CornerDownRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommentThread({ reelId, reelOwnerId, currentUser, commentCount, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const loadComments = useCallback(async () => {
    try {
      const data = await base44.entities.Comment.filter({ reel_id: reelId }, "-created_date", 100);
      setComments(data || []);
    } catch {}
    setLoading(false);
  }, [reelId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const isOwner = currentUser?.id === reelOwnerId;

  const topLevel = comments.filter(c => !c.parent_id && (!c.hidden || isOwner));
  const repliesOf = (parentId) => comments.filter(c => c.parent_id === parentId && (!c.hidden || isOwner));

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const c = await base44.entities.Comment.create({
        reel_id: reelId,
        content: newComment.trim(),
        author_name: currentUser?.username || currentUser?.full_name || "Utilisateur",
        author_avatar: currentUser?.avatar_url || "",
      });
      setComments(prev => [c, ...prev]);
      onCountChange?.(commentCount + 1);
      setNewComment("");
      trackInteraction(reelId, "comment", reelOwnerId);
      updateTrendingScore(reelId);
      if (reelOwnerId && reelOwnerId !== currentUser?.id) {
        createNotification({
          recipientId: reelOwnerId,
          type: "comment",
          title: "Nouveau commentaire",
          body: `${currentUser?.username || "Quelqu'un"} a commenté votre vidéo`,
          sourceUserId: currentUser?.id,
          reelId,
        });
      }
    } catch {}
  };

  const submitReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      const c = await base44.entities.Comment.create({
        reel_id: reelId,
        content: replyText.trim(),
        parent_id: parentId,
        author_name: currentUser?.username || currentUser?.full_name || "Utilisateur",
        author_avatar: currentUser?.avatar_url || "",
      });
      setComments(prev => [...prev, c]);
      onCountChange?.(commentCount + 1);
      setReplyText("");
      setReplyTo(null);
      const parent = comments.find(c => c.id === parentId);
      if (parent && parent.created_by_id && parent.created_by_id !== currentUser?.id) {
        createNotification({
          recipientId: parent.created_by_id,
          type: "reply",
          title: "Réponse à votre commentaire",
          body: `${currentUser?.username || "Quelqu'un"} a répondu à votre commentaire`,
          sourceUserId: currentUser?.id,
          reelId,
        });
      }
    } catch {}
  };

  const togglePin = async (comment) => {
    try {
      await base44.entities.Comment.update(comment.id, { pinned: !comment.pinned });
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, pinned: !c.pinned } : c));
    } catch {}
  };

  const toggleHide = async (comment) => {
    try {
      await base44.entities.Comment.update(comment.id, { hidden: !comment.hidden });
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, hidden: !c.hidden } : c));
    } catch {}
  };

  const handleDelete = async (comment) => {
    try {
      await base44.entities.Comment.delete(comment.id);
      setComments(prev => prev.filter(c => c.id !== comment.id && c.parent_id !== comment.id));
      onCountChange?.(commentCount - 1);
    } catch {}
  };

  const renderComment = (c, isReply = false) => {
    const canManage = isOwner || c.created_by_id === currentUser?.id;
    return (
      <div key={c.id} className={cn("flex gap-2", isReply && "ml-8")}>
        {isReply && <CornerDownRight className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-2" />}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0 overflow-hidden">
          {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : (c.author_name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground font-medium">{c.author_name || "Utilisateur"}</p>
            {c.pinned && <Pin className="w-3 h-3 text-primary fill-primary" />}
            {c.hidden && isOwner && <span className="text-[9px] text-yellow-400">[masqué]</span>}
          </div>
          <p className={cn("text-sm text-white", c.hidden && !isOwner && "hidden")}>{c.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="text-[10px] text-muted-foreground hover:text-white">Répondre</button>
            {canManage && (
              <>
                {isOwner && <button onClick={() => togglePin(c)} className="text-[10px] text-muted-foreground hover:text-primary">{c.pinned ? "Désépingler" : "Épingler"}</button>}
                {isOwner && <button onClick={() => toggleHide(c)} className="text-[10px] text-muted-foreground hover:text-yellow-400">{c.hidden ? "Afficher" : "Masquer"}</button>}
                <button onClick={() => handleDelete(c)} className="text-[10px] text-muted-foreground hover:text-destructive">Supprimer</button>
              </>
            )}
          </div>
          {replyTo === c.id && (
            <div className="flex gap-1.5 mt-1.5">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply(c.id)}
                placeholder="Répondre..." className="flex-1 h-8 rounded-lg bg-background border border-border px-2.5 text-xs text-white" maxLength={500} autoFocus />
              <button onClick={() => submitReply(c.id)} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Send className="w-3 h-3 text-white" /></button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Sort: pinned first, then by date
  const sorted = [...topLevel].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="relative w-full bg-card rounded-t-2xl border-t border-border max-h-[60%] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <p className="text-sm font-semibold text-white">{commentCount} commentaire{commentCount > 1 ? "s" : ""}</p>
        <button onClick={() => onCountChange?.(commentCount)}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? <p className="text-center text-sm text-muted-foreground py-8">Chargement...</p> :
         sorted.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">Soyez le premier à commenter !</p> :
         sorted.map(c => (
           <div key={c.id} className="space-y-2">
             {renderComment(c)}
             {repliesOf(c.id).map(r => renderComment(r, true))}
           </div>
         ))}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && submitComment()}
          placeholder="Ajouter un commentaire..." className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" maxLength={500} />
        <button onClick={submitComment} className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"><Send className="w-4 h-4 text-white" /></button>
      </div>
    </div>
  );
}