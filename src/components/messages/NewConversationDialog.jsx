import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const categories = [
  { id: "support", label: "Assistance technique" },
  { id: "billing", label: "Facturation" },
  { id: "suggestion", label: "Suggestion" },
  { id: "bug", label: "Signaler un bug" },
  { id: "feature_request", label: "Demande de fonctionnalité" },
  { id: "other", label: "Autre" },
];

export default function NewConversationDialog({ userId, onClose, onCreated }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("support");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) return;
    setSending(true);
    try {
      const conv = await base44.entities.Conversation.create({
        subject: subject.trim(),
        category,
        type: "direct",
        status: "open",
        owner_id: userId,
        last_message_at: new Date().toISOString(),
      });
      await base44.entities.Message.create({
        conversation_id: conv.id,
        content: content.trim(),
        sender_role: "user",
        owner_id: userId,
        read: false,
      });
      onCreated(conv);
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Nouveau message</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Sujet</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Résumé de votre message"
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Décrivez votre demande en détail..."
              rows={5}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-white resize-none outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || !content.trim() || sending}
            className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}