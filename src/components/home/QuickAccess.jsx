import { Link } from "react-router-dom";
import { Scissors, Globe, Star, MessageSquare } from "lucide-react";

const shortcuts = [
  { label: "Montage", icon: Scissors, path: "/app/editor" },
  { label: "Démo", icon: Globe, path: "/app/demo" },
  { label: "Influenceurs", icon: Star, path: "/app/influencers" },
  { label: "Messages", icon: MessageSquare, path: "/app/messages" },
];

export default function QuickAccess() {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
          >
            <item.icon className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}