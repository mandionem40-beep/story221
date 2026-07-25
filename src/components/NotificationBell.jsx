import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, Heart, MessageCircle, UserPlus, Diamond, Gift, TrendingUp, Shield, Star, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { groupNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";

const TYPE_CONFIG = {
  like: { icon: Heart, color: "text-pink-400", bg: "bg-pink-500/15" },
  comment: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/15" },
  reply: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/15" },
  follow: { icon: UserPlus, color: "text-green-400", bg: "bg-green-500/15" },
  diamonds: { icon: Diamond, color: "text-primary", bg: "bg-primary/15" },
  influencer_published: { icon: Star, color: "text-purple-400", bg: "bg-purple-500/15" },
  performance: { icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  moderation: { icon: Shield, color: "text-orange-400", bg: "bg-orange-500/15" },
  referral_signup: { icon: UserPlus, color: "text-green-400", bg: "bg-green-500/15" },
  referral_published: { icon: Gift, color: "text-primary", bg: "bg-primary/15" },
  referral_reward: { icon: Gift, color: "text-primary", bg: "bg-primary/15" },
  system: { icon: Bell, color: "text-muted-foreground", bg: "bg-secondary" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function NotificationBell({ user, variant = "default" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  // Load notifications
  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;
    const unsub = base44.entities.Notification.subscribe(() => {
      loadNotifications();
    });
    return unsub;
  }, [user?.id]);

  // Poll every 30s as fallback
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const all = await base44.entities.Notification.filter(
        { recipient_id: user.id },
        "-created_date",
        30
      );
      const grouped = groupNotifications(all || []);
      setNotifications(grouped);
      setUnreadCount(grouped.filter(n => !n.read).length);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClickNotif = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.reel_id) {
      navigate("/app/reels");
    } else if (notif.type === "follow") {
      navigate("/app/profile");
    } else if (notif.type === "diamonds" || notif.type === "referral_reward") {
      navigate("/app/diamonds");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setOpen(o => !o)}
        className={cn(
          "relative flex items-center justify-center active:scale-95 transition-transform",
          variant === "bare"
            ? "w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0"
            : "w-9 h-9 rounded-full bg-secondary border border-border"
        )}
        aria-label="Notifications"
      >
        <Bell className={cn("w-4 h-4", unreadCount > 0 ? "text-primary" : "text-muted-foreground")} />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center glow-red-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary animate-ping opacity-60" />
          </>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-11 w-[min(92vw,360px)] max-h-[70vh] rounded-2xl bg-card border border-border shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Aucune notification</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">Vos activitées apparaîtront ici</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => {
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  const Icon = config.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClickNotif(n)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors",
                        !n.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white leading-snug">{n.title}</p>
                        {n.body && (
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{timeAgo(n.created_date)}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}