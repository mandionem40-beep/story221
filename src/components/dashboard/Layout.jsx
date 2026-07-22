import { useEffect, useState, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Home, Library, Clapperboard, Diamond, User, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const navItems = [
  { label: "Accueil", icon: Home, path: "/app" },
  { label: "Bibliothèque", icon: Library, path: "/app/library" },
  { label: "Reels", icon: Clapperboard, path: "/app/reels" },
  { label: "Diamants", icon: Diamond, path: "/app/diamonds" },
  { label: "Profil", icon: User, path: "/app/profile" },
];

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
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser, location.pathname]);

  const handleLogout = () => {
    logout();
  };

  const diamonds = currentUser?.diamonds ?? 0;
  const username = currentUser?.username || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Utilisateur";
  const avatarUrl = currentUser?.avatar_url;
  const isAdmin = currentUser?.role === "super_admin";

  const isActive = (path) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border z-40">
        <div className="p-6">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-primary text-white glow-red-sm"
                  : "text-muted-foreground hover:text-white hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-secondary transition-all mt-4 border-t border-border pt-4"
            >
              <Bell className="w-5 h-5" />
              Admin
            </Link>
          )}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border">
          <Link to="/app/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              <p className="text-xs text-muted-foreground">{diamonds} 💎</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
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
        <Link
          to="/app/diamonds"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border"
        >
          <Diamond className="w-4 h-4 text-primary" fill="currentColor" />
          <span className="text-sm font-semibold text-white">{diamonds}</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <Outlet context={{ currentUser, refreshUser }} />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors",
                isActive(item.path) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}