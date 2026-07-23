import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Loader2, Headphones } from "lucide-react";
import { base44 } from "@/api/base44Client";

const categoryLabels = {
  support: "Assistance",
  billing: "Facturation",
  suggestion: "Suggestion",
  bug: "Bug",
  feature_request: "Demande",
  other: "Autre",
};

export default function MessageThread({ conversation, onBack, isAdmin }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversation?.id) return;
    loadMessages(conversation.id);
    const unsub = base44.entities.Message.subscribe(() => loadMessages(conversation.id));
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadMessages = async (convId) => {
    try {
      const msgs = await base44.entities.Message.filter({ conversation_id: convId }, "created_date", 500);
      setMessages(msgs || []);
      const unread = (msgs || []).filter((m) => !m.read && m.sender_role !== (isAdmin ? "admin" : "user"));
      if (unread.length > 0) {
        base44.entities.Message.bulkUpdate(
          unread.map((m) => ({ id: m.id, read: true }))
        ).catch(() => {});
        base44.entities.Conversation.update(convId, { unread_count: 0 }).catch(() => {});
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        content: text.trim(),
        sender_role: isAdmin ? "admin" : "user",
        owner_id: conversation.owner_id || conversation.created_by_id,
        read: false,
      });
      await base44.entities.Conversation.update(conversation.id, {
        last_message_at: new Date().toISOString(),
      });
      setText("");
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Headphones className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Sélectionnez une conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{conversation.subject}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{categoryLabels[conversation.category] || conversation.category}</span>
            {conversation.type === "campaign" && (
              <span className="text-[10px] text-primary font-medium">Annonce officielle</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : (
          messages.map((m) => {
            const isMe = isAdmin ? m.sender_role === "admin" : m.sender_role === "user";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  isMe ? "bg-primary text-white" : "bg-secondary text-white"
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`text-[9px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                    {new Date(m.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {messages.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun message. Démarrez la conversation.</p>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            rows={1}
            className="flex-1 min-h-[40px] max-h-24 rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}