import { useState, useEffect } from "react";
import { BarChart3, CheckCircle2, Loader2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

export default function PollCard({ poll, userId, isAdmin }) {
  const [votes, setVotes] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poll?.id) return;
    loadData(poll.id);
    const unsub = base44.entities.PollVote.subscribe(() => loadData(poll.id));
    return unsub;
  }, [poll?.id]);

  const loadData = async (pollId) => {
    try {
      const [allVotes, myVotes] = await Promise.all([
        base44.entities.PollVote.filter({ poll_id: pollId }, "created_date", 500),
        userId ? base44.entities.PollVote.filter({ poll_id: pollId, created_by_id: userId }) : Promise.resolve([]),
      ]);
      setVotes(allVotes || []);
      if (myVotes?.length) setMyVote(myVotes[0].option_index);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleVote = async (optionIndex) => {
    if (myVote !== null || poll.status === "closed") return;
    setVoting(true);
    try {
      await base44.entities.PollVote.create({ poll_id: poll.id, option_index: optionIndex });
      setMyVote(optionIndex);
      toast({ title: "Vote enregistré !" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le vote.", variant: "destructive" });
    }
    setVoting(false);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  const totalVotes = votes.length;
  const voteCounts = (poll.options || []).map((_, i) => votes.filter((v) => v.option_index === i).length);
  const hasVoted = myVote !== null;
  const isClosed = poll.status === "closed" || (poll.end_date && new Date(poll.end_date) < new Date());

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-bold text-white">{poll.question}</h3>
        {isClosed ? (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Fermé
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-green-400 flex-shrink-0">
            <Clock className="w-3 h-3" /> Actif
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 mb-4 text-xs text-muted-foreground">
        <BarChart3 className="w-3 h-3" />
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
      </div>

      <div className="space-y-2">
        {(poll.options || []).map((option, i) => {
          const count = voteCounts[i] || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isMyChoice = myVote === i;
          const showResults = hasVoted || isAdmin || isClosed;

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={hasVoted || isClosed || voting || isAdmin}
              className={`w-full relative rounded-xl border overflow-hidden text-left transition-all ${
                isMyChoice ? "border-primary" : "border-border"
              } ${!hasVoted && !isClosed && !isAdmin ? "hover:border-primary/40 cursor-pointer" : "cursor-default"}`}
            >
              {showResults && (
                <div
                  className={`absolute inset-y-0 left-0 ${isMyChoice ? "bg-primary/20" : "bg-secondary"}`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span className={`text-sm ${isMyChoice ? "text-primary font-medium" : "text-white"}`}>{option}</span>
                {showResults && (
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{pct}%</span>
                )}
                {isMyChoice && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 ml-1" />}
              </div>
            </button>
          );
        })}
      </div>

      {!hasVoted && !isClosed && !isAdmin && (
        <p className="text-[11px] text-muted-foreground mt-3 text-center">Cliquez sur une option pour voter</p>
      )}
    </div>
  );
}