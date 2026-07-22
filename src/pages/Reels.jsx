import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReelCard from "@/components/reels/ReelCard";
import { Sparkles } from "lucide-react";

export default function Reels() {
  const { currentUser } = useOutletContext();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Reel.list("-trending_score", 50);
        setReels(data || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const index = Math.round(scrollTop / itemHeight);
    setActiveIndex(index);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-white font-medium mb-1">Aucun Reel pour le moment</p>
        <p className="text-sm text-muted-foreground mb-4">Soyez le premier à publier une création !</p>
        <a href="/app/create" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
          Créer
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-3.5rem)] lg:h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
    >
      {reels.map((reel, i) => (
        <div key={reel.id} className="h-[calc(100vh-3.5rem)] lg:h-screen snap-start">
          <ReelCard reel={reel} currentUser={currentUser} isActive={i === activeIndex} />
        </div>
      ))}
    </div>
  );
}