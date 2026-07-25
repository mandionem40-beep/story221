import { Link } from "react-router-dom";
import { Scissors, Globe, Star, MessageSquare, Zap } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const shortcuts = [
  { label: "Montage", icon: Scissors, path: "/app/editor" },
  { label: "Démo", icon: Globe, path: "/app/demo" },
  { label: "Influenceurs", icon: Star, path: "/app/influencers" },
  { label: "Messages", icon: MessageSquare, path: "/app/messages" },
  { label: "Vidéo Rapide", icon: Zap, path: "/app/quick-create" },
];

export default function QuickAccess({ currentUser }) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        <div className="flex flex-col items-center justify-center gap-1 py-2.5 sm:py-3 px-1 rounded-xl bg-card border border-border min-w-0">
          <NotificationBell user={currentUser} variant="bare" />
          <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground text-center leading-tight">
            Notifs
          </span>
        </div>
        {shortcuts.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1 py-2.5 sm:py-3 px-1 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors min-w-0"
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground text-center leading-tight break-words w-full">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}