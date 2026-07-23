import { useState } from "react";
import { Search, MessageSquarePlus, Inbox, Clock } from "lucide-react";

const categoryLabels = {
  support: "Assistance",
  billing: "Facturation",
  suggestion: "Suggestion",
  bug: "Bug",
  feature_request: "Demande",
  other: "Autre",
};

const categoryColors = {
  support: "text-blue-400 bg-blue-400/10",
  billing: "text-yellow-400 bg-yellow-400/10",
  suggestion: "text-green-400 bg-green-400/10",
  bug: "text-red-400 bg-red-400/10",
  feature_request: "text-purple-400 bg-purple-400/10",
  other: "text-muted-foreground bg-secondary",
};

export default function ConversationList({ conversations, selectedId, onSelect, onNew }) {
  const [search, setSearch] = useState("");

  const filtered = (conversations || []).filter((c) =>
    c.subject?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onNew}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Nouveau
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-secondary text-sm text-white placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune conversation</p>
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex flex-col gap-1 px-3 py-3 text-left border-b border-border/50 transition-colors ${
                selectedId === c.id ? "bg-primary/10" : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white truncate flex-1">{c.subject}</span>
                {c.unread_count > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {c.unread_count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColors[c.category] || categoryColors.other}`}>
                  {categoryLabels[c.category] || c.category}
                </span>
                {c.type === "campaign" && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-primary bg-primary/10">
                    Annonce
                  </span>
                )}
                {c.status === "closed" && (
                  <span className="text-[10px] text-muted-foreground">Clôturé</span>
                )}
              </div>
              {c.last_message_at && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(c.last_message_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}