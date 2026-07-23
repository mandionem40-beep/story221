import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageSquare, BarChart3, Star, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ConversationList from "@/components/messages/ConversationList";
import MessageThread from "@/components/messages/MessageThread";
import NewConversationDialog from "@/components/messages/NewConversationDialog";
import FeedbackWidget from "@/components/messages/FeedbackWidget";
import PollCard from "@/components/messages/PollCard";

export default function Messages() {
  const { currentUser } = useOutletContext();
  const [tab, setTab] = useState("inbox");
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [polls, setPolls] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(true);

  const loadConversations = async () => {
    if (!currentUser?.id) return;
    try {
      const convs = await base44.entities.Conversation.filter(
        { owner_id: currentUser.id },
        "-last_message_at",
        200
      );
      setConversations(convs || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const loadPolls = async () => {
    try {
      const active = await base44.entities.Poll.filter({ status: "active" }, "-created_date", 50);
      setPolls(active || []);
    } catch { /* ignore */ }
    setPollsLoading(false);
  };

  useEffect(() => {
    loadConversations();
    const unsub = base44.entities.Message.subscribe(() => loadConversations());
    return unsub;
  }, [currentUser?.id]);

  useEffect(() => {
    if (tab === "polls") loadPolls();
  }, [tab]);

  useEffect(() => {
    if (selected) {
      const conv = conversations.find((c) => c.id === selected);
      if (conv) setSelected(conv.id);
    }
  }, [conversations]);

  const selectedConv = conversations.find((c) => c.id === selected);

  const tabs = [
    { id: "inbox", label: "Messages", icon: MessageSquare },
    { id: "polls", label: "Sondages", icon: BarChart3 },
    { id: "feedback", label: "Avis", icon: Star },
  ];

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6">
      {/* Header */}
      <div className="px-4 sm:px-0 mb-4 pt-4 sm:pt-0">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Communiquez directement avec l'équipe Story221</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-0 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-white border border-border"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0 sm:gap-4 h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)]">
          {/* Conversation list */}
          <div className={`rounded-t-xl lg:rounded-xl bg-card border border-border overflow-hidden ${selected ? "hidden lg:block" : "block"}`}>
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selected}
                onSelect={setSelected}
                onNew={() => setShowNew(true)}
              />
            )}
          </div>

          {/* Thread */}
          <div className={`rounded-b-xl lg:rounded-xl bg-card border border-border overflow-hidden ${!selected ? "hidden lg:block" : "block"}`}>
            <MessageThread
              conversation={selectedConv}
              onBack={() => setSelected(null)}
            />
          </div>
        </div>
      )}

      {tab === "polls" && (
        <div className="px-4 sm:px-0">
          {pollsLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
          ) : polls.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-8 text-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucun sondage actif pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {polls.map((p) => (
                <PollCard key={p.id} poll={p} userId={currentUser?.id} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "feedback" && (
        <div className="px-4 sm:px-0 max-w-xl">
          <FeedbackWidget userId={currentUser?.id} />
        </div>
      )}

      {showNew && (
        <NewConversationDialog
          userId={currentUser?.id}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); loadConversations(); }}
        />
      )}
    </div>
  );
}