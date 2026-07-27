import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { fetchFeed, getFeedRatios } from "@/lib/reels-feed";
import ReelCard from "@/components/reels/ReelCard";
import { Sparkles, Loader2, Flame, UserCheck, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "foryou", label: "Pour toi", icon: Sparkles },
  { id: "trending", label: "Tendances", icon: Flame },
  { id: "following", label: "Abonnements", icon: UserCheck },
  { id: "discover", label: "Découverte", icon: Compass },
];

export default function Reels() {
  const { currentUser } = useOutletContext();
  const [activeTab, setActiveTab] = useState("foryou");
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ratios, setRatios] = useState(null);
  const containerRef = useRef(null);

  const loadFeed = useCallback(async (tab, pageNum = 0) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const r = ratios || await getFeedRatios();
      if (!ratios) setRatios(r);
      const newReels = await fetchFeed({ userId: currentUser?.id, page: pageNum, pageSize: 8, feedType: tab, ratios: r });
      if (pageNum === 0) {
        setReels(newReels);
        setActiveIndex(0);
      } else {
        setReels(prev => [...prev, ...newReels]);
      }
      setHasMore(newReels.length === 8);
    } catch { setHasMore(false); }
    setLoading(false);
    setLoadingMore(false);
  }, [currentUser?.id, ratios]);

  useEffect(() => {
    setReels([]);
    setPage(0);
    setHasMore(true);
    setActiveIndex(0);
    loadFeed(activeTab, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const index = Math.round(container.scrollTop / container.clientHeight);
    setActiveIndex(index);
    if (index >= reels.length - 3 && hasMore && !loadingMore) {
      const next = page + 1;
      setPage(next);
      loadFeed(activeTab, next);
    }
  }, [reels.length, hasMore, loadingMore, page, activeTab, loadFeed]);

  // Auto-advance to next reel when current video ends
  const handleReelEnded = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const nextIndex = activeIndex + 1;
    if (nextIndex < reels.length) {
      container.scrollTo({
        top: nextIndex * container.clientHeight,
        behavior: "smooth",
      });
      setActiveIndex(nextIndex);
    }
  }, [activeIndex, reels.length]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Sparkles className="w-6 h-6 text-primary animate-pulse" /></div>;
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
          {activeTab === "following" ? <UserCheck className="w-8 h-8 text-muted-foreground" /> : <Sparkles className="w-8 h-8 text-muted-foreground" />}
        </div>
        <p className="text-white font-medium mb-1">
          {activeTab === "following" ? "Aucun contenu" : activeTab === "trending" ? "Pas encore de tendances" : "Aucun Reel pour le moment"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {activeTab === "following" ? "Suivez des créateurs pour voir leurs vidéos ici" : "Soyez le premier à publier !"}
        </p>
        {activeTab !== "following" && (
          <Link to="/app/create" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Créer</Link>
        )}
        {activeTab === "following" && (
          <button onClick={() => setActiveTab("discover")} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Découvrir des créateurs</button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border bg-background/80 backdrop-blur-xl z-10">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:text-white hover:bg-secondary")}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {reels.map((reel, i) => (
          <div key={reel.id} className="h-full snap-start">
            <ReelCard reel={reel} currentUser={currentUser} isActive={i === activeIndex} isNext={i === activeIndex + 1} onEnded={handleReelEnded} />
          </div>
        ))}
        {loadingMore && (
          <div className="flex items-center justify-center h-20"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        )}
        {!hasMore && reels.length > 0 && (
          <div className="flex items-center justify-center h-20"><p className="text-xs text-muted-foreground">Vous avez tout vu pour le moment 🎬</p></div>
        )}
      </div>
    </div>
  );
}