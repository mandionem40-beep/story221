import { Link } from "react-router-dom";
import { Scissors, Globe, Star, MessageSquare, Zap } from "lucide-react";

const shortcuts = [
  { label: "Montage", icon: Scissors, path: "/app/editor" },
  { label: "Démo", icon: Globe, path: "/app/demo" },
  { label: "Influenceurs", icon: Star, path: "/app/influencers" },
  { label: "Messages", icon: MessageSquare, path: "/app/messages" },
  { label: "Vidéo Rapide", icon: Zap, path: "/app/quick-create", highlighted: true },
];

export default function QuickAccess({ currentUser }) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {shortcuts.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 sm:py-3 px-1 rounded-xl border transition-all min-w-0 relative overflow-hidden ${
              item.highlighted
                ? "bg-primary/10 border-primary/50 hover:border-primary glow-red-sm"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            {item.highlighted && (
              <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full animate-[shimmer_2.5s_linear_infinite]" />
            )}
            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 relative ${item.highlighted ? "text-primary animate-pulse" : "text-primary"}`} />
            <span className={`text-[9px] sm:text-[10px] font-medium text-center leading-tight break-words w-full relative ${item.highlighted ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}