import { useEffect, useState, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Home, Library, Clapperboard, Diamond, User, LogOut, Bell, MessageSquare, Star, Scissors, Globe } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";


// Desktop sidebar uses all items; mobile bottom nav uses only the 4 main ones
const navItems = [
{ label: "Accueil", icon: Home, path: "/app" },
{ label: "Bibliothèque", icon: Library, path: "/app/library" },
{ label: "Reels", icon: Clapperboard, path: "/app/reels" },
{ label: "Montage", icon: Scissors, path: "/app/editor" },
{ label: "Démo", icon: Globe, path: "/app/demo" },
{ label: "Influenceurs", icon: Star, path: "/app/influencers" },
{ label: "Messages", icon: MessageSquare, path: "/app/messages" },
{ label: "Diamants", icon: DiamondIcon, path: "/app/diamonds" }];


// Mobile bottom nav — only 4 main buttons
const mobileNavItems = [
{ label: "Accueil", icon: Home, path: "/app" },
{ label: "Bibliothèque", icon: Library, path: "/app/library" },
{ label: "Reels", icon: Clapperboard, path: "/app/reels" },
{ label: "Diamants", icon: DiamondIcon, path: "/app/diamonds" }];


export default function Layout() {
  const { user, logout, checkUserAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await base44.auth.me();
      setCurrentUser(freshUser);
    } catch {


      // fallback to auth context user
    }}, []);
  useEffect(() => {
    refreshUser();
  }, [refreshUser, location.pathname]);

  // Redirect to profile completion if missing required fields (not for admins)
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "admin" || currentUser.role === "super_admin") return;
    if (!currentUser.username || !currentUser.phone || !currentUser.avatar_url) {
      navigate("/complete-profile", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
  };

  const diamonds = currentUser?.diamonds ?? 0;
  const username = currentUser?.username || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Utilisateur";
  const avatarUrl = currentUser?.avatar_url;
  const isAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";

  const isActive = (path) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border z-40">
        <div className="p-6 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) =>
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              isActive(item.path) ?
              "bg-primary text-white glow-red-sm" :
              "text-muted-foreground hover:text-white hover:bg-secondary"
            )}>
            
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )}
          {isAdmin &&
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-secondary transition-all mt-4 border-t border-border pt-4">
            
              <Bell className="w-5 h-5" />
              Admin
            </Link>
          }
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border">
          <Link to="/app/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
            {avatarUrl ?
            <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> :

            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {diamonds}
                <DiamondIcon className="w-3 h-3" />
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
            
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/app/diamonds"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-card to-secondary border border-primary/30 hover:border-primary/60 transition-all duration-300 active:scale-95 group overflow-hidden">
            
            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/25 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <DiamondIcon className="w-4 h-4 relative animate-pulse drop-shadow-[0_0_4px_rgba(255,0,51,0.8)]" />
            <span className="text-sm font-bold text-white relative tabular-nums">{diamonds}</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
          </Link>
          <NotificationBell user={currentUser} variant="bare" />
          </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <Outlet context={{ currentUser, refreshUser }} />
      </main>

      {/* Mobile Bottom Nav — 4 main buttons only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) =>
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors",
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            )}>
            
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )}
        </div>
      </nav>
    </div>);

}