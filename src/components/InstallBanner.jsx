import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Share2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("s221_install_dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (!isStandalone) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      dismiss();
    } else if (isIOS) {
      setShowIOSHelp(true);
    }
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("s221_install_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[100] sm:max-w-sm sm:left-auto sm:right-6 sm:bottom-6"
        >
          <div className="rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            {/* Compact header row */}
            <div className="flex items-center gap-3 p-3.5">
              <div className="flex-shrink-0">
                <Logo size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">Installer l'app</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Story221 sur votre écran</p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Fermer"
                className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action row */}
            <div className="px-3.5 pb-3.5">
              {showIOSHelp && isIOS ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/60">
                    <Share className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <p className="text-[11px] text-white leading-snug">
                      Bouton <span className="font-bold text-primary">Partager</span> → « Sur l'écran d'accueil »
                    </p>
                  </div>
                  <button onClick={dismiss} className="w-full h-9 rounded-lg bg-primary text-white text-xs font-semibold">
                    J'ai compris
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full h-9 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 glow-red-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer en 1 clic
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}