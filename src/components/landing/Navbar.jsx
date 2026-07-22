import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import InstallBanner from "@/components/InstallBanner";

const navLinks = [
  { label: "Accueil", href: "#hero" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Reels", href: "#reels" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <InstallBanner />
      <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-2">
          {/* Logo */}
          <a href="#hero" className="group flex-shrink-0">
            <Logo size="md" />
          </a>

          {/* Nav links — always visible, scrollable on mobile */}
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-hide flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors duration-200 relative group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA — always visible */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link
              to="/login"
              className="text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors whitespace-nowrap"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all glow-red-sm whitespace-nowrap"
            >
              Créer
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}